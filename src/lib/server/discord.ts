import type { Feedback } from '$lib/db/schema/feedback';
import { env } from '$env/dynamic/private';
import { usersTable, type User } from '$lib/db/schema/users';
import { eq } from 'drizzle-orm';
import type { Database } from '$lib/server/db';
import { logger } from '$lib/server/logger';

export enum DiscordChannel {
	TECH_TEAM_ALERTS,
	SENIOR_STAFF_ALERTS
}

const DISCORD_CHANNELS = {
	[DiscordChannel.TECH_TEAM_ALERTS]: env.DISCORD_WEBHOOK_TECH_TEAM_ALERTS,
	[DiscordChannel.SENIOR_STAFF_ALERTS]: env.DISCORD_WEBHOOK_SENIOR_STAFF_ALERTS
};

export type DiscordEmbed = {
	title: string | null;
	description: string | null;
	color: number | null;
	fields: {
		name: string | null;
		value: string | null;
		inline: boolean;
	}[];
	footer: {
		text: string | null;
	};
	timestamp: string;
};

function getDisplayName(user: User) {
	if (!user) return 'Unknown User';
	const name = user.preferredName || `${user.firstName} ${user.lastName}`;
	return `${name} (${user.cid})`;
}

export async function sendDiscordEmbed(channel: DiscordChannel, embed: DiscordEmbed) {
	const webhookUrl = DISCORD_CHANNELS[channel];

	await fetch(webhookUrl, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			embeds: [embed]
		})
	});
}

export async function notifyDiscordOfFeedbackStatusChange(
	db: Database,
	feedback: Feedback,
	adminUser: User
) {
	const submitter = await db.query.usersTable.findFirst({
		where: eq(usersTable.id, feedback.submitterId)
	});
	const controller = await db.query.usersTable.findFirst({
		where: eq(usersTable.id, feedback.controllerId)
	});
	const admin = await db.query.usersTable.findFirst({
		where: eq(usersTable.id, adminUser.id)
	});

	if (submitter && controller && admin) {
		const embed = {
			title: '🎯 Feedback Status Changed',
			description: feedback.feedback,
			color: feedback.status === 'approved' ? 0x5865f2 : 0xed4245,
			fields: [
				{
					name: '👤 Controller',
					value: getDisplayName(controller),
					inline: true
				},
				{
					name: '⭐ Rating',
					value: feedback.rating.toUpperCase(),
					inline: true
				},
				{
					name: '👤 Reviewed by',
					value: getDisplayName(admin),
					inline: true
				},
				{
					name: '🔄 Review Status',
					value: feedback.status.toUpperCase(),
					inline: true
				}
			],
			footer: {
				text: `Feedback ID: ${feedback.id}`
			},
			timestamp: feedback.createdAt!.toISOString()
		};

		await sendDiscordEmbed(DiscordChannel.SENIOR_STAFF_ALERTS, embed);
	}
}

export async function notifyDiscordOfFeedback(db: Database, feedback: Feedback) {
	const submitter = await db.query.usersTable.findFirst({
		where: eq(usersTable.id, feedback.submitterId)
	});
	const controller = await db.query.usersTable.findFirst({
		where: eq(usersTable.id, feedback.controllerId)
	});

	if (submitter && controller) {
		const embed = {
			title: '🎯 New Controller Feedback',
			description: feedback.feedback,
			color: 0x5865f2,
			fields: [
				{
					name: '👤 Controller',
					value: getDisplayName(controller),
					inline: true
				},
				{
					name: '⭐ Rating',
					value: feedback.rating.toUpperCase(),
					inline: true
				},
				{
					name: '📝 Submitted by',
					value: getDisplayName(submitter),
					inline: true
				}
			],
			footer: {
				text: `Feedback ID: ${feedback.id}`
			},
			timestamp: feedback.createdAt!.toISOString()
		};

		await sendDiscordEmbed(DiscordChannel.SENIOR_STAFF_ALERTS, embed);
	}
}

// Only positive feedback is shared publicly. Excluding the negative ratings (rather
// than listing the positive ones) means new positive ratings are picked up automatically.
const UNANNOUNCED_RATINGS = ['poor', 'fair'];

/**
 * Shares approved feedback in the community announcements channel, in the same format
 * the old website used. Unlike the staff alerts, this is public: no submitter, reviewer,
 * CID, or feedback ID.
 *
 * Never throws, so a Discord problem can't fail the approval.
 */
export async function announceApprovedFeedback(db: Database, feedback: Feedback) {
	if (feedback.status !== 'approved' || UNANNOUNCED_RATINGS.includes(feedback.rating)) {
		return;
	}

	const webhookUrl = env.DISCORD_WEBHOOK_COMMUNITY_ANNOUNCEMENTS;
	if (!webhookUrl) {
		logger.warn(
			'DISCORD_WEBHOOK_COMMUNITY_ANNOUNCEMENTS is not set, skipping feedback announcement'
		);
		return;
	}

	try {
		const controller = await db.query.usersTable.findFirst({
			where: eq(usersTable.id, feedback.controllerId)
		});

		if (!controller) {
			logger.warn(`Controller ${feedback.controllerId} not found, skipping feedback announcement`);
			return;
		}

		// Matches the old website's post: "Braden Kearney (BK)"
		const name = controller.preferredName || `${controller.firstName} ${controller.lastName}`;
		const controllerName = controller.operatingInitials
			? `${name} (${controller.operatingInitials})`
			: name;

		const fields = [
			{ name: 'Controller', value: controllerName, inline: true },
			{ name: 'Position', value: feedback.position, inline: true },
			// "very_good" -> "very good"
			{ name: 'Rating', value: feedback.rating.replaceAll('_', ' '), inline: true }
		];

		const comments = feedback.feedback?.trim();
		if (comments) {
			// Discord caps embed field values at 1024 characters
			fields.push({
				name: 'Comments',
				value: comments.length > 1024 ? `${comments.slice(0, 1023)}…` : comments,
				inline: false
			});
		}

		const response = await fetch(webhookUrl, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				content: 'New feedback received!',
				embeds: [{ color: 0x2ecc71, fields }]
			})
		});

		if (!response.ok) {
			logger.error(`Feedback announcement failed: ${response.status} ${await response.text()}`);
		}
	} catch (error) {
		logger.error('Feedback announcement failed', error);
	}
}

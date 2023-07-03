import { SettingsFormFieldValidatorEvent } from "@devvit/public-api/settings/types.js";
import {
    Metadata,
  } from '@devvit/protos';
import { RedditAPIClient, getSetting } from "@devvit/public-api";

export const SETTING_VIP_FLAIR = 'vip-post-flair';
export const SETTING_VIP_USERS = 'vip_users';

export async function validateVipUsers(
    event: SettingsFormFieldValidatorEvent<string>, 
    metadata: Metadata | undefined,
    reddit: RedditAPIClient
) {
    // Don't check on edit
    if (event.isEditing || !event.value) { return; }

    const userNames = event?.value.split(/\s+/);
    for (name in userNames) {
        if (!(await reddit.getUserByUsername(name, metadata))) {
            return `Invalid reddit username: ${name}`
        }
    }
}

export async function getPassListUsernames(
    metadata: Metadata
): Promise<string[]|undefined> {

    const passListText: string|undefined = await getSetting(SETTING_VIP_USERS, metadata);
    if (passListText == undefined) {
        console.log(`Not value found for setting: [${SETTING_VIP_USERS}]`);
        return;
    }

    const usernames = passListText.split(/\s+/);
    if (!usernames || usernames.length <= 0) {
        console.log(`Setting: [${SETTING_VIP_USERS}] contained no useable values: [${passListText}]`);
        return;
    }
    return usernames;
}

export async function getProtectedFlairText(
    metadata: Metadata
): Promise<string|undefined> {
    const flairText: string|undefined = await getSetting(SETTING_VIP_FLAIR, metadata);
    if (flairText == undefined || flairText.trim().length == 0) {
        console.log(`No useable value found for setting: [${SETTING_VIP_FLAIR}]`);
        return;
    }
    return flairText!.trim();
}
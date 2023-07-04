import { 
    SettingsFormFieldValidatorEvent 
} from "@devvit/public-api/settings/types.js";

import {
    Metadata,
    PostSubmit,
    LogMessage,
    Severity
} from '@devvit/protos';

import { 
    Devvit, 
    getSetting 
} from "@devvit/public-api";

const logger = Devvit.use(Devvit.Types.Logger);

// Constants
export const SETTING_PROTECTED_FLAIR = 'protected-flair-text';
export const SETTING_PASSLIST_USERS = 'passlist-usernames';

const MAX_PASSLIST_CHARS = 2000;
const MAX_PROTECTED_FLAIR_CHARS = 64;

export function validatePassList(
    event: SettingsFormFieldValidatorEvent<string>, 
    _metadata: Metadata | undefined
) {
    if (!event.value) { return; }
    if (event.value.length > MAX_PASSLIST_CHARS) {
        return `Pass list must be less than ${MAX_PASSLIST_CHARS} characters`;
    }
    // TODO: maybe validate each username is a reddit user, but may take too long on each edit
}

export function validateProtectedFlair(
    event: SettingsFormFieldValidatorEvent<string>, 
    _metadata: Metadata | undefined
) {
    if (!event.value) { return; }
    if (event.value.length > MAX_PROTECTED_FLAIR_CHARS) {
        return `Flair text must be less than ${MAX_PASSLIST_CHARS} characters`
    }
    // TODO: check against the subreddits existing flair
}

/**
 * Gets an array of Reddit usernames in the pass-list from the application settings.
 * If the settings could not be parsed or doesn't exist, undefined is returned.
 * @param metadata metadata object needed by Devvit
 * @returns Optional array containing reddit usernames in the pass-list
 */
export async function getPassListUsernames(
    metadata: Metadata
): Promise<string[]|undefined> {

    const passListText: string|undefined = await getSetting(SETTING_PASSLIST_USERS, metadata);
    if (passListText == undefined) {
        console.log(`No value found for setting: [${SETTING_PASSLIST_USERS}]`);
        return;
    }

    const usernames = passListText.split(/\s+/);
    if (!usernames || usernames.length <= 0) {
        console.log(`Setting: [${SETTING_PASSLIST_USERS}] contained no useable values: [${passListText}]`);
        return;
    }
    return usernames;
}

/**
 * Gets the text value setting of the Link/Post flair that's protected by the passlist. 
 * If the setting could not be parsed or doesn't exist, undefined is returned.
 * @param metadata metadata object needed by Devvit
 * @returns Optional value of the post flair text that should be protected
 */
export async function getProtectedFlairText(
    metadata: Metadata
): Promise<string|undefined> {
    const flairText: string|undefined = await getSetting(SETTING_PROTECTED_FLAIR, metadata);
    if (flairText == undefined || flairText.trim().length == 0) {
        console.log(`No useable value found for setting: [${SETTING_PROTECTED_FLAIR}]`);
        return;
    }
    return flairText!.trim();
}

/**
 * Decides whether or not the post should be allowed
 * @param postSubmission devvit object containing post data
 * @param metadata metadata object needed by Devvit
 * @returns true if the post should be allowed, false otherwise
 */
export async function shouldPostPass(
    postSubmission: PostSubmit,
    metadata: Metadata
): Promise<boolean> {

    // Get all data needed for the request
    const protectedFlairText = await getProtectedFlairText(metadata);
    const passListUserNames = await getPassListUsernames(metadata);
    const postAuthor = postSubmission.author?.name;
    const postFlair = postSubmission.post?.linkFlair?.text

    await logI('Flair Pass List Request Details:' +
        `\nSetting - [${SETTING_PASSLIST_USERS}]: ${passListUserNames}` +
        `\nSetting - [${SETTING_PROTECTED_FLAIR}]: ${protectedFlairText}` +
        `\npostAuthor: ${postAuthor}` +
        `\npostFlairText: ${postFlair}\n\n`, metadata);

    // Check that ALL values are present. If not, we can't process the post
    if (protectedFlairText == undefined || passListUserNames == undefined || 
        postAuthor == undefined || postFlair == undefined) {
            await logI('ALLOW: Unable to get all info needed to process Post Flair passList. Allowing the post', metadata);
            return true;
    }

    // If the post flair is set, and it's not protected. Then allow
    if (postFlair != protectedFlairText) {
        await logI(`ALLOW: Post flair of [${postFlair}] is not protected. Protected flair: [${protectedFlairText}]`, metadata);
        return true;
    }

    // If the post's author is in the pass-list, then allow the post
    if (passListUserNames.indexOf(postAuthor) > -1) {
        await logI(`ALLOW: User [${postAuthor}] is in pass-list for protected flair: [${protectedFlairText}]`, metadata);
        return true;
    }

    // If we reach this point, post author is NOT in the passlist for the protected post flair
    await logI(`DENY: User [${postAuthor}] is NOT in pass-list for protected flair: [${protectedFlairText}]`, metadata);
    return false;
}

/**
 * Log an Info message
 * @param message
 * @param metadata 
 */
async function logI(message: string|undefined, metadata?: Metadata) {
    await logger.Log(LogMessage.fromPartial({
        severity: Severity.INFO,
        message: message
    }), metadata);
}

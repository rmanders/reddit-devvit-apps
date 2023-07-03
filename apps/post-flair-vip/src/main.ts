import {
    PostSubmit,
    Metadata,
  } from '@devvit/protos';

import { 
    SETTING_VIP_FLAIR,
    SETTING_VIP_USERS,
    validateVipUsers
} from './validators.js'

import { Devvit, RedditAPIClient, getSetting } from '@devvit/public-api';

const reddit = new RedditAPIClient();

Devvit.addSettings([
    {
        type: 'string',
        name: SETTING_VIP_FLAIR,
        label: 'The text value of the protected post flair',
    },
    {
        type: 'paragraph',
        name: SETTING_VIP_USERS,
        label: 'Reddit usernames of users in the pass-list (without the "u/", one per line)',
        onValidate: (event, metadata) => { validateVipUsers(event, metadata, reddit); }
    }
]);

/**
 * Trigger that checks on each new post
 */
Devvit.addTrigger({
    event: Devvit.Trigger.PostSubmit,
    async handler(postSubmission: PostSubmit, metadata?: Metadata) {
        
      console.log(`Received OnPostSubmit event:\n${JSON.stringify(postSubmission)}\n`,
      `Metadata:\n${JSON.stringify(metadata)}\n\n`);

      // Get the vip flair:
      const vipFlairText = await getSetting(SETTING_VIP_FLAIR, metadata);
      console.log(`VIP flair setting: ${vipFlairText}`);

      // Get the current Post flair (if any)
      const curPostFlair = postSubmission.post?.linkFlair?.text;
      if (!curPostFlair) {
        console.log("No post flair set. Nothing to do");
        return;
      }
      console.log(`Current Post Flair text: ${curPostFlair}`);

      // Check if post flair is vip
      if (curPostFlair !== vipFlairText) {
        console.log(`Post Flair is not same as VIP Flair. No further action needed`);
        return;
      }
      console.log(`Post's flair is a VIP flair.`);

      // Check if user is in VIP list
      const author = postSubmission.author?.name;
      if (!author) {
        console.log('Can\'t get post author. Exiting.');
        return;
      }
      console.log(`Found post author: ${author}`);

      // Get the list if VIP users
      const vipUsersText: String|undefined = await getSetting(SETTING_VIP_USERS, metadata);
      if (!vipUsersText) {
        console.log(`${SETTING_VIP_USERS} settings value is empty. Exiting.`);
        return;
      }
      const vipUsers = vipUsersText.split(/\s+/);

      // Check if post author is in VIP list
      if (vipUsers.indexOf(author) > -1) {
        console.log(`Author: ${author}, is a VIP user for flair: ${vipFlairText}!`);
        return;
      }
      
      // If author is not a VIP, remove the post
      // TODO: Can we add a removal reason or detail for the mod log?
      console.log(`Author: ${author}, is NOT VIP user for flair: ${vipFlairText}. Removing post!`);
      await reddit.remove(postSubmission.post!.id, false, metadata);

    },
  });

export default Devvit;

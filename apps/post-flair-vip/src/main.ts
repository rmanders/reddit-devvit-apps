import {
    PostSubmit,
    Metadata,
  } from '@devvit/protos';

  import { validateVipUsers } from './validators.js'

import { Devvit, RedditAPIClient, getSetting } from '@devvit/public-api';

// TODO: REMOVE THIS and replace with config or dynamically acquired value
const SUBREDDIT = 'schlockenspiel';
const SETTING_VIP_FLAIR = 'vip-post-flair';
const SETTING_VIP_USERS = 'vip_users';

Devvit.addSettings([
    {
        type: 'string',
        name: SETTING_VIP_FLAIR,
        label: 'Existing post flair text that should be VIP-limited',
    },
    {
        type: 'paragraph',
        name: SETTING_VIP_USERS,
        label: 'VIP users (one per line)',
        onValidate: validateVipUsers
    }
]);

Devvit.addTrigger({
    event: Devvit.Trigger.PostSubmit,
    async handler(postSubmission: PostSubmit, metadata?: Metadata) {
      console.log(`Received OnPostSubmit event:\n${JSON.stringify(postSubmission)}\n`,
      `Metadata:\n${JSON.stringify(metadata)}`);
      // TODO: if post is using vip flair, the check user is in vip list. if not, remove

      // REMOVE THIS: list all post flair
      const reddit = new RedditAPIClient();
      const sub = await reddit.getSubredditByName(SUBREDDIT, metadata);
      const postFlairs = await sub.getPostFlairTemplates();
      console.log(`Post Flairs:\n${JSON.stringify(postFlairs)}`);


      // Get the vip flair:
      const vipFlairText = await getSetting(SETTING_VIP_FLAIR, metadata);
      console.log(`VIP flair setting: ${vipFlairText}`);

      // Get the current Post flair (if any)
      const curPostFlair = postSubmission.post?.linkFlair?.text;
      if (!curPostFlair) {
        console.log("Not post flair set. Nothing to do");
        return;
      }
      console.log(`Current Post Flair text: ${curPostFlair}`);

      // Check if post flair is vip
      if (curPostFlair !== vipFlairText) {
        console.log(`Post Flair is not same as VIP Flair. No further action needed`);
        return;
      }

      // Check if user is in VIP list

    },
  });

export default Devvit;

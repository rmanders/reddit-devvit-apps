import {
    PostSubmit,
    Metadata,
  } from '@devvit/protos';

import { 
    SETTING_PROTECTED_FLAIR,
    SETTING_PASSLIST_USERS,
    validatePassList,
    validateProtectedFlair,
    shouldPostPass
} from './flairPasslist.js'

import { Devvit, RedditAPIClient } from '@devvit/public-api';

const reddit = new RedditAPIClient();

Devvit.addSettings([
    {
        type: 'string',
        name: SETTING_PROTECTED_FLAIR,
        label: 'The text value of the protected post flair',
        onValidate: validateProtectedFlair
    },
    {
        type: 'paragraph',
        name: SETTING_PASSLIST_USERS,
        label: 'Reddit usernames of users in the pass-list (without the "u/", one per line)',
        onValidate: validatePassList
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

      // Check if the post should be allowed based on the flair and author
      if (!await shouldPostPass(postSubmission, metadata!)) {
        await reddit.remove(postSubmission.post!.id, false, metadata);
      }
    },
  });

export default Devvit;

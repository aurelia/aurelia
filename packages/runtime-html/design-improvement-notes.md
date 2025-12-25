1. renderer & node sequence & containerless
    - during compilation, compiler inserts `<!--au-->` comment markers before containerless CEs to mark them as targets, so node sequence can locate them
        node-sequence needs to do this early because it needs to acquire its targets early
    - it'd be worth considering if renderer is given un-modified, original host element when there's a containerless setup on a CE
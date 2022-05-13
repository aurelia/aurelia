1. renderer & node sequence & containerless
    - during compilation, compiler replace containerless CE with `<au-m>` to mark it as a target, so node sequence can replace it with comment
        node-sequence needs to do this early because it needs to acquire its targets early
    - it'd be worth considering if renderer is given un-modified, original host element when there's a containerless setup on a CE
import { treaty } from '@elysiajs/eden'
import type { App } from '../../api/src/app'

const edenClient = treaty<App>(process.env.NEXT_PUBLIC_EDEN_URL!, {
    fetch: {
        credentials: "include",
    }
});
const localEdenClient = treaty<App>(process.env.NEXT_PUBLIC_EDEN_SERVER_URL!, {
    fetch: {
        credentials: "include",
    }
});

export { edenClient, localEdenClient };
import { revalidateTag} from 'next/cache'

export async function POST(req, res) {
  revalidateTag('carriers');
    return new Response('Not Found', { status: 200 });
  }
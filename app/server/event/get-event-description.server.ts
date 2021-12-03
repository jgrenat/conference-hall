import { DataFunctionArgs } from '@remix-run/server-runtime';
import z from 'zod';
import { CfpState, getCfpState } from '../common/cfp-dates';
import { db } from '../db';

const eventSlugParam = z.string().nonempty();

export interface EventDescription {
  slug: string;
  name: string;
  description: string;
  address: string | null;
  type: 'CONFERENCE' | 'MEETUP';
  conferenceStart?: string;
  conferenceEnd?: string;
  cfpStart?: string;
  cfpEnd?: string;
  cfpState: CfpState;
};

export async function getEventDescription({ params }: DataFunctionArgs): Promise<EventDescription> {
  const criterias = eventSlugParam.safeParse(params.eventSlug);
  if (!criterias.success) {
    throw new Response('Bad search parameters', { status: 400 });
  }

  const slug= criterias.data;
  const event = await db.event.findUnique({ where: { slug } });
  if (!event) {
    throw new Response('Event not found', { status: 404 }); 
  }

  return {
    slug: event.slug,
    name: event.name,
    description: event.description,
    address: event.address,
    type: event.type,
    conferenceStart: event.conferenceStart?.toUTCString(),
    conferenceEnd: event.conferenceEnd?.toUTCString(),
    cfpStart: event.cfpStart?.toUTCString(),
    cfpEnd: event.cfpEnd?.toUTCString(),
    cfpState: getCfpState(event.type, event.cfpStart, event.cfpEnd),
  };
}

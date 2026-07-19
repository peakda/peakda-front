import { TERMS_OF_SERVICE } from './terms-of-service'
import { PRIVACY_POLICY } from './privacy-policy'
import { MARKETING_PUSH_CONSENT } from './marketing-push-consent'
import { LOCATION_POLICY } from './location-policy'
import type { LegalDocument, LegalSlug } from './types'

export type { ContentBlock, LegalSection, LegalChapter, LegalDocument, LegalSlug } from './types'

export const LEGAL_CONTENT: Record<LegalSlug, LegalDocument> = {
  'terms-of-service': TERMS_OF_SERVICE,
  'privacy-policy': PRIVACY_POLICY,
  'marketing-push-consent': MARKETING_PUSH_CONSENT,
  'location-policy': LOCATION_POLICY,
}

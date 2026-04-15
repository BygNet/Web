import type { BygVerification } from '@bygnet/types'

export function getVerificationColor(verification: BygVerification): string {
  switch (verification) {
    case 'notable':
      return '#9f7cf5'
    case 'organization':
      return '#ed4eb4'
    case 'government':
      return '#717171'
    case 'identity':
      return '#5ecad5'
  }
}

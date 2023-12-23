/**
 * Twilio API
 */

interface TwilioVoiceWebhookBody {
  AccountSid: string;
  ApiVersion: string;
  CallSid: string;
  CallStatus: "ringing" | "in-progress";
  CallToken: string;
  Called: string;
  CalledCity: string;
  CalledCountry: string;
  CalledState: string;
  CalledZip: string;
  Caller: string;
  CallerCity: string;
  CallerCountry: string;
  CallerState: string;
  CallerZip: string;
  Direction: string;
  SpeechResult?: string;
  From: string;
  FromCity: string;
  FromCountry: string;
  FromState: string;
  FromZip: string;
  StirVerstat: string;
  To: string;
  ToCity: string;
  ToCountry: string;
  ToState: string;
  ToZip: string;
}

/**
 * Endato API
 */
interface PersonSearchResponse {
  persons: Person[];
  counts: Counts;
  smartSearchStatistics: SmartSearchStatistics;
  pagination: Pagination;
  searchCriteria: any[];
  totalRequestExecutionTimeMs: number;
  requestId: string;
  requestType: string;
  requestTime: string;
  isError: boolean;
  error: Error;
}

interface Person {
  tahoeId: string;
  name: Name;
  isPublic: boolean;
  isOptedOut: boolean;
  sparseFlag: number;
  isPremium: boolean;
  dob: string;
  age: number;
  dobFirstSeen: string;
  dobLastSeen: string;
  datesOfDeath: any[];
  akas: Aka[];
  mergedNames: MergedName[];
  locations: Location[];
  addresses: Address[];
  phoneNumbers: PhoneNumber[];
  emailAddresses: any[];
  relativesSummary: RelativesSummary[];
  associatesSummary: AssociatesSummary[];
  fullName: string;
  indicators: Indicators;
  driversLicenseDetail: any[];
  hasAdditionalData: boolean;
  propensityToPayScore: PropensityToPayScore;
  associates?: Associate[];
}

interface Name {
  prefix: string;
  firstName: string;
  middleName: string;
  lastName: string;
  suffix: string;
  rawNames: string[];
  publicFirstSeenDate: string;
  totalFirstSeenDate: string;
  sourceSummary: any;
}

interface Aka {
  prefix: string;
  firstName: string;
  middleName: string;
  lastName: string;
  suffix: string;
  rawNames: string[];
  publicFirstSeenDate: string;
  totalFirstSeenDate: string;
  sourceSummary: any;
}

interface MergedName {
  prefix: string;
  firstName: string;
  middleName: string;
  lastName: string;
  suffix: string;
  rawNames: string[];
  publicFirstSeenDate: any;
  totalFirstSeenDate: any;
  sourceSummary: any;
}

interface Location {
  city: string;
  state: string;
}

interface Address {
  isDeliverable: boolean;
  isMergedAddress: boolean;
  isPublic: boolean;
  addressQualityCodes: string[];
  addressHash: string;
  houseNumber: string;
  streetPreDirection: string;
  streetName: string;
  streetPostDirection: string;
  streetType: string;
  unit: string;
  unitType?: string;
  city: string;
  state: string;
  county: string;
  zip: string;
  zip4: string;
  latitude: string;
  longitude: string;
  addressOrder: number;
  highRiskMarker: HighRiskMarker;
  propertyIndicator: string;
  bldgCode: string;
  utilityCode: string;
  unitCount: number;
  firstReportedDate: string;
  lastReportedDate: string;
  publicFirstSeenDate: string;
  totalFirstSeenDate: string;
  phoneNumbers: string[];
  neighbors: any[];
  neighborSummaryRecords: any[];
  fullAddress: string;
  sourceSummary: any;
}

interface HighRiskMarker {
  isHighRisk: boolean;
  sic: string;
  addressType: string;
}

interface PhoneNumber {
  phoneNumber: string;
  company: string;
  location: string;
  phoneType: string;
  isConnected: boolean;
  isPublic: boolean;
  latitude: string;
  longitude: string;
  phoneOrder: number;
  firstReportedDate: string;
  lastReportedDate: string;
  publicFirstSeenDate?: string;
  totalFirstSeenDate: string;
  sourceSummary: any;
}

interface RelativesSummary {
  tahoeId: string;
  prefix: string;
  firstName: string;
  middleName: string;
  lastName: string;
  suffix: string;
  dob: string;
  isPrivate: boolean;
  isOptedOut: boolean;
  isDeceased: boolean;
  relativeLevel: string;
  relativeType: string;
  spouse: number;
  sharedHouseholdIds: string[];
  score: number;
  oldSpouse: boolean;
}

interface AssociatesSummary {
  tahoeId: string;
  prefix: string;
  firstName: string;
  middleName: string;
  lastName: string;
  suffix: string;
  isPrivate: boolean;
  isOptedOut: boolean;
  isDeceased: boolean;
  dob: string;
  score: number;
}

interface Indicators {
  hasBankruptcyRecords: number;
  hasBusinessRecords: number;
  hasDivorceRecords: number;
  hasDomainsRecords: number;
  hasEvictionsRecords: number;
  hasFeinRecords: number;
  hasForeclosuresRecords: number;
  hasForeclosuresV2Records: number;
  hasJudgmentRecords: number;
  hasLienRecords: number;
  hasMarriageRecords: number;
  hasProfessionalLicenseRecords: number;
  hasPropertyRecords: number;
  hasVehicleRegistrationsRecords: number;
  hasWorkplaceRecords: number;
  hasDeaRecords: number;
  hasPropertyV2Records: number;
  hasUccRecords: number;
  hasUnbankedData: number;
  hasMobilePhones: number;
  hasLandLines: number;
  hasEmails: number;
  hasAddresses: number;
  hasCurrentAddresses: number;
  hasHistoricalAddresses: number;
  hasDebtRecords: number;
}

interface PropensityToPayScore {
  transactionId: string;
  suffix: string;
  firstName: string;
  middleName: string;
  lastName: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  zip4: string;
  measures: any[];
}

interface Associate {
  tahoeId: string;
  name: Name2;
  isPublic: boolean;
  isOptedOut: boolean;
  sparseFlag: number;
  isPremium: boolean;
  dob: string;
  age: number;
  datesOfBirth: DatesOfBirth[];
  datesOfDeath: any[];
  deathRecords: DeathRecords;
  akas: Aka2[];
  mergedNames: MergedName2[];
  locations: Location2[];
  addresses: Address2[];
  phoneNumbers: PhoneNumber2[];
  emailAddresses: EmailAddress[];
  fullName: string;
  driversLicenseDetail: any[];
  hasAdditionalData: boolean;
  propensityToPayScore: PropensityToPayScore2;
}

interface Name2 {
  prefix: string;
  firstName: string;
  middleName: string;
  lastName: string;
  suffix: string;
  rawNames: string[];
  publicFirstSeenDate: string;
  totalFirstSeenDate: string;
  sourceSummary: any;
}

interface DatesOfBirth {
  age: number;
  sourceSummary: any;
}

interface DeathRecords {
  isDeceased: boolean;
  sourceSummary: any;
}

interface Aka2 {
  prefix: string;
  firstName: string;
  middleName: string;
  lastName: string;
  suffix: string;
  rawNames: string[];
  publicFirstSeenDate?: string;
  totalFirstSeenDate: string;
  sourceSummary: any;
}

interface MergedName2 {
  prefix: string;
  firstName: string;
  middleName: string;
  lastName: string;
  suffix: string;
  rawNames: string[];
  publicFirstSeenDate: any;
  totalFirstSeenDate: any;
  sourceSummary: any;
}

interface Location2 {
  city: string;
  state: string;
}

interface Address2 {
  isDeliverable: boolean;
  isMergedAddress: boolean;
  isPublic: boolean;
  addressQualityCodes: string[];
  addressHash: string;
  houseNumber: string;
  streetPreDirection: string;
  streetName: string;
  streetPostDirection: string;
  streetType: string;
  unit: string;
  unitType?: string;
  city: string;
  state: string;
  county: string;
  zip: string;
  zip4: string;
  latitude: string;
  longitude: string;
  addressOrder: number;
  highRiskMarker: HighRiskMarker2;
  propertyIndicator: string;
  bldgCode: string;
  utilityCode: string;
  unitCount: number;
  firstReportedDate: string;
  lastReportedDate: string;
  publicFirstSeenDate: string;
  totalFirstSeenDate: string;
  phoneNumbers: string[];
  neighbors: any[];
  neighborSummaryRecords: any[];
  fullAddress: string;
  sourceSummary: any;
}

interface HighRiskMarker2 {
  isHighRisk: boolean;
  sic: string;
  addressType: string;
}

interface PhoneNumber2 {
  phoneNumber: string;
  company: string;
  location: string;
  phoneType: string;
  isConnected: boolean;
  isPublic: boolean;
  latitude: string;
  longitude: string;
  phoneOrder: number;
  firstReportedDate: string;
  lastReportedDate: string;
  publicFirstSeenDate: string;
  totalFirstSeenDate: string;
  sourceSummary: any;
}

interface EmailAddress {
  emailAddress: string;
  emailOrdinal: number;
  emailEngagementData: EmailEngagementData;
  isPremium: boolean;
  nonBusiness: number;
  sourceSummary: any;
}

interface EmailEngagementData {
  lastCheckDate?: string;
  isGoodDomain: boolean;
  isMatched: boolean;
  engagementScore: number;
  lastTouchDate?: string;
  sendTime: number;
  bestDayOfTheWeek: string;
  bestTimeOfTheDay: string;
  frequency: string;
  naics: string[];
  isBounce: boolean;
}

interface PropensityToPayScore2 {
  transactionId: string;
  suffix: string;
  firstName: string;
  middleName: string;
  lastName: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  zip4: string;
  measures: any[];
}

interface Counts {
  searchResults: number;
  searchResultsOverflow: boolean;
  names: number;
  socialSecurityNumbers: number;
  datesOfBirth: number;
  datesOfDeath: number;
  deathRecords: number;
  addresses: number;
  phoneNumbers: number;
  emailAddresses: number;
  relatives: number;
  associates: number;
  businessRecords: number;
  debtRecords: number;
  evictionRecords: number;
  foreclosureRecords: number;
  foreclosureV2Records: number;
  professionalLicenseRecords: number;
  expectedCount: number;
}

interface SmartSearchStatistics {
  userInput: any;
  criteriaGroupId: any;
  isSuccessful: boolean;
  successfulPattern: any;
  totalTimeInMS: number;
  resultCount: number;
  patterns: any[];
  searches: any[];
}

interface Pagination {
  currentPageNumber: number;
  resultsPerPage: number;
  totalPages: number;
  totalResults: number;
}

interface Error {
  inputErrors: any[];
  warnings: string[];
}

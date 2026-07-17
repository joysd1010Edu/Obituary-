export type ObituaryStatus = "pending" | "approved" | "rejected";

export interface MemorialSubmission {
  id: string;
  obituaryId: string;
  memorialImage: string;
  deceasedFirstName: string;
  deceasedLastName: string;
  rejectionReason?: string;
  dateOfBirth: string;
  dateOfDeath: string;
  biography: string;
  status: ObituaryStatus;
  paymentMethod: "stripe" | "token" | "admin_override";
  createdAt: string;
  updatedAt: string;
  submittedAt?: string;

  name: string;
  location: string;
  country: string;
  memorialDetails: string;
  familyDetails: string;
  lifeStory: string;
  rememberForEverQuote: string;
  favouriteQuote: string;
  careerSummery: string;
  relationToDeceased: string;
  funeralNotice?: any;

  // Raw data for admin editing
  funeralHomeLogo?: string;
  deadPersonPhoto?: string[];
  familyTreeDiagram?: string;
  funeralHomeDetails?: any;
  funeralHomeAdvertisement?: any[];

  // Visibility flags
  memorialDetailVisibilityStatus?: boolean;
  familyDetailVisibilityStatus?: boolean;
  lifeStoryVisibilityStatus?: boolean;
  rememberForEverQuoteVisibilityStatus?: boolean;
  favouriteQuoteVisibilityStatus?: boolean;
  careerSummeryVisibilityStatus?: boolean;
  donationsEnabled?: boolean;
  showInLivesRememberedForever?: boolean;
}

export interface SubmissionDraft {
  memorialImage: string;
  deceasedFirstName: string;
  deceasedLastName: string;
  rejectionReason: string;
  dateOfBirth: string;
  dateOfDeath: string;
  biography: string;
  status: ObituaryStatus;
  paymentMethod: "stripe" | "token" | "admin_override";

  name: string;
  location: string;
  country: string;
  memorialDetails: string;
  familyDetails: string;
  lifeStory: string;
  rememberForEverQuote: string;
  favouriteQuote: string;
  careerSummery: string;
  relationToDeceased: string;
  funeralNotice?: any;

  // Images (kept URLs + new File blobs)
  funeralHomeLogo?: string;
  newFuneralHomeLogo?: File | null;
  deadPersonPhoto?: string[];
  newDeadPersonPhotos?: File[];
  familyTreeDiagram?: string;
  newFamilyTreeDiagram?: File | null;

  // Funeral home details
  funeralHomeDetails?: any;
  funeralHomeAdvertisement?: any[];

  // Visibility flags
  memorialDetailVisibilityStatus?: boolean;
  familyDetailVisibilityStatus?: boolean;
  lifeStoryVisibilityStatus?: boolean;
  rememberForEverQuoteVisibilityStatus?: boolean;
  favouriteQuoteVisibilityStatus?: boolean;
  careerSummeryVisibilityStatus?: boolean;
  donationsEnabled?: boolean;
  showInLivesRememberedForever?: boolean;
}

export interface DashboardUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  userImage: string;
  funeralHome?: {
    logoImageUrl?: string;
    [key: string]: any;
  };
}

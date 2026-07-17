/**
 * Mock data for the frontend UI shell.
 */

export interface FamilyRelation {
  name: string;
  relation: string;
}

export interface ObituaryMock {
  id: string;
  creatorId?: string;
  deceasedFirstName: string;
  deceasedLastName: string;
  dateOfBirth?: string;
  dateOfDeath: string;
  age?: number;
  memorialQuote?: string;
  fallbackQuoteIndex?: number;
  location: {
    country?: string;
    state?: string;
    city: string;
  };
  headline: string;
  excerpt: string;
  biography?: string;
  images: string[];
  featuredToday?: boolean;
  allTimeMemorable?: boolean;
  showInLivesRememberedForever?: boolean;
  status?: "pending_payment" | "live" | "archived";
  paymentMethod?: "stripe" | "token" | "admin_override";
  paymentId?: string;
  isFeatured?: boolean;
  viewCount?: number;
  familyTree?: FamilyRelation[];
}

export interface CondolenceMock {
  id: string;
  obituaryId: string;
  name: string;
  message: string;
}

export interface UserMock {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: "user" | "admin";
}

export interface MemorableQuote {
  text: string;
  author: string;
}

export const fallbackMemorableQuotes: MemorableQuote[] = [
  {
    text: "The only way to do great work is to love what you do.",
    author: "Aristotle",
  },
  {
    text: "We are what we repeatedly do. Excellence, then, is not an act, but a habit.",
    author: "Marcus Aurelius",
  },
  {
    text: "Life is really simple, but we insist on making it complicated.",
    author: "Confucius",
  },
  {
    text: "No one can make you feel inferior without your consent.",
    author: "Socrates",
  },
  {
    text: "Happiness depends upon ourselves.",
    author: "Seneca",
  },
];

export const mockObituaries: ObituaryMock[] = [
  {
    id: "1",
    creatorId: "u2",
    deceasedFirstName: "John",
    deceasedLastName: "Doe",
    dateOfBirth: "1938-03-14",
    dateOfDeath: "2026-05-01",
    age: 88,
    location: { city: "Dhaka", country: "Bangladesh" },
    headline: "Beloved father and teacher",
    excerpt:
      "John Doe peacefully passed away after a life of service, learning, and quiet generosity.",
    biography:
      "John Doe spent his life mentoring students and building a community around patience, discipline, and care.",
    images: [
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=900&q=80",
    ],
    featuredToday: true,
    allTimeMemorable: true,
    memorialQuote: "Keep loving each other just like I loved you ...",
    status: "live",
    paymentMethod: "stripe",
    isFeatured: true,
    viewCount: 1842,
    familyTree: [
      { name: "Mary Doe", relation: "Spouse" },
      { name: "Anna Doe", relation: "Daughter" },
    ],
  },
  {
    id: "2",
    creatorId: "u2",
    deceasedFirstName: "Aisha",
    deceasedLastName: "Khan",
    dateOfBirth: "1941-09-03",
    dateOfDeath: "2025-11-10",
    age: 84,
    location: { city: "Chittagong", country: "Bangladesh" },
    headline: "Cherished community leader",
    excerpt:
      "Aisha Khan devoted her life to community care, literacy, and family support.",
    biography:
      "Aisha Khan organized neighborhood reading circles and quietly supported dozens of families through difficult seasons.",
    images: [
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=900&q=80",
    ],
    featuredToday: true,
    allTimeMemorable: true,
    memorialQuote:
      "A life spent caring for others becomes the memory that outlives us.",
    status: "live",
    paymentMethod: "admin_override",
    viewCount: 1220,
    familyTree: [
      { name: "Imran Khan", relation: "Son" },
      { name: "Sara Khan", relation: "Daughter" },
    ],
  },
  {
    id: "3",
    creatorId: "u2",
    deceasedFirstName: "Rahim",
    deceasedLastName: "Ali",
    dateOfBirth: "1956-02-10",
    dateOfDeath: "2026-04-18",
    age: 70,
    location: { city: "Sylhet", country: "UK" },
    headline: "A life full of songs and stories",
    excerpt:
      "Rahim Ali was known for his storytelling, calm presence, and unwavering kindness.",
    biography:
      "Rahim Ali was a musician, a teacher, and a beloved storyteller who made every room feel warmer.",
    images: [
      "https://images.unsplash.com/photo-1507120878965-80924bbece8b?auto=format&fit=crop&w=900&q=80",
    ],
    featuredToday: true,
    memorialQuote:
      "Songs, stories, and kindness can live in a family for generations.",
    status: "live",
    paymentMethod: "token",
    isFeatured: true,
    viewCount: 980,
  },
  {
    id: "5",
    creatorId: "u2",
    deceasedFirstName: "Mina",
    deceasedLastName: "Rahman",
    dateOfBirth: "1964-12-11",
    dateOfDeath: "2026-05-12",
    age: 61,
    location: { city: "Cumilla", country: "Ireland" },
    headline: "A steadfast voice for local families",
    excerpt:
      "Mina Rahman helped build neighborhood programs that supported caregivers, students, and elders.",
    biography:
      "Mina Rahman was deeply involved in neighborhood care programs and left behind a legacy of practical compassion.",
    images: [
      "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=900&q=80",
    ],
    featuredToday: true,
    memorialQuote:
      "The measure of a life is not its length, but the love it leaves behind.",
    status: "live",
    paymentMethod: "stripe",
    isFeatured: true,
    viewCount: 721,
  },
  {
    id: "4",
    creatorId: "u2",
    deceasedFirstName: "Nusrat",
    deceasedLastName: "Jahan",
    dateOfBirth: "1972-06-25",
    dateOfDeath: "2024-08-22",
    age: 52,
    location: { city: "Rajshahi", country: "Bangladesh" },
    headline: "Treasured mentor and artist",
    excerpt:
      "Nusrat Jahan created spaces where young people felt seen, heard, and encouraged.",
    biography:
      "Nusrat Jahan created art programs for children and taught with generosity, grace, and deep conviction.",
    images: [
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=900&q=80",
    ],
    featuredToday: true,
    allTimeMemorable: true,
    fallbackQuoteIndex: 3,
    status: "live",
    paymentMethod: "admin_override",
    viewCount: 1435,
  },
  {
    id: "6",
    creatorId: "u2",
    deceasedFirstName: "Salma",
    deceasedLastName: "Begum",
    dateOfBirth: "1935-01-19",
    dateOfDeath: "2023-02-06",
    age: 88,
    location: { city: "Khulna", country: "Bangladesh" },
    headline: "A lifelong advocate for dignity and care",
    excerpt:
      "Salma Begum was known for her generosity, her calm voice, and the steady way she cared for her neighbors.",
    biography:
      "Salma Begum spent decades supporting local families and building trust wherever she went.",
    images: [
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=900&q=80",
    ],
    allTimeMemorable: true,
    fallbackQuoteIndex: 1,
    status: "live",
    paymentMethod: "stripe",
    viewCount: 1098,
  },
  {
    id: "7",
    creatorId: "u2",
    deceasedFirstName: "Farid",
    deceasedLastName: "Hossain",
    dateOfBirth: "1948-07-28",
    dateOfDeath: "2022-10-17",
    age: 74,
    location: { city: "Barishal", country: "UK" },
    headline: "Remembered for mentoring a generation",
    excerpt:
      "Farid Hossain helped young people find their voice through music, study, and patient encouragement.",
    biography:
      "Farid Hossain built a reputation as a mentor who made learning feel possible for everyone.",
    images: [
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=900&q=80",
    ],
    allTimeMemorable: true,
    fallbackQuoteIndex: 0,
    status: "live",
    paymentMethod: "admin_override",
    viewCount: 1326,
  },
  {
    id: "8",
    creatorId: "u2",
    deceasedFirstName: "Noor",
    deceasedLastName: "Akter",
    dateOfBirth: "1959-11-04",
    dateOfDeath: "2021-04-21",
    age: 61,
    location: { city: "Mymensingh", country: "Ireland" },
    headline: "An artist who turned memory into care",
    excerpt:
      "Noor Akter created spaces where stories, art, and kindness could live side by side.",
    biography:
      "Noor Akter was cherished for her warmth, artistic eye, and her habit of helping quietly.",
    images: [
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=900&q=80",
    ],
    allTimeMemorable: true,
    fallbackQuoteIndex: 4,
    status: "live",
    paymentMethod: "token",
    viewCount: 904,
  },
];

export const featuredTodayObituaries = mockObituaries.filter(
  (obituary) => obituary.featuredToday,
);
export const allTimeMemorableObituaries = mockObituaries.filter(
  (obituary) => obituary.allTimeMemorable,
);

export const mockCondolences: CondolenceMock[] = [
  {
    id: "c1",
    obituaryId: "1",
    name: "Mary",
    message: "So sorry for your loss.",
  },
  {
    id: "c2",
    obituaryId: "1",
    name: "Hassan",
    message: "A gentle soul remembered with love.",
  },
];

export const mockUsers: UserMock[] = [
  {
    id: "u1",
    firstName: "Admin",
    lastName: "User",
    email: "admin@example.com",
    role: "admin",
  },
  {
    id: "u2",
    firstName: "Guest",
    lastName: "Member",
    email: "user@example.com",
    role: "user",
  },
];

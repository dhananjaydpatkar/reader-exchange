/**
 * Application Tour Configuration
 * 
 * TOUR_VERSION: Increment this whenever a new feature is added to re-trigger
 * the tour for users who have previously dismissed it.
 * Users who skipped the tour will only see it again if this version changes.
 */
export const TOUR_VERSION = '1.0.0';

export interface TourStep {
    id: string;
    /** CSS selector to highlight. If null, shows a centered modal (no highlight). */
    target: string | null;
    title: string;
    description: string;
    /** Optional image/illustration hint */
    image?: string;
    /** Which roles should see this step. Empty means all roles. */
    roles?: string[];
    /** Position of tooltip relative to target */
    placement?: 'top' | 'bottom' | 'left' | 'right' | 'center';
    /** Tab that needs to be active for this step */
    tab?: string;
}

export const tourSteps: TourStep[] = [
    // Step 0: Welcome
    {
        id: 'welcome',
        target: null,
        title: '👋 Welcome to Reader Exchange!',
        description: 'Let us walk you through the key features of the platform so you can start exchanging books right away. This will only take a minute!',
        placement: 'center',
    },
    // Step 1: Summary Banner
    {
        id: 'summary-banner',
        target: '[data-tour="summary-banner"]',
        title: '📊 Your Dashboard at a Glance',
        description: 'This banner gives you a quick overview — how many books are available nearby, your personal library count, and your active exchange requests.',
        placement: 'bottom',
    },
    // Step 2: Add Book
    {
        id: 'add-book',
        target: '[data-tour="add-book"]',
        title: '📚 List a Book',
        description: 'Click here to add a new book to your collection. You just need the ISBN number — we\'ll auto-fill the title, author, and cover for you!',
        placement: 'bottom',
    },
    // Step 3: ISBN Info
    {
        id: 'isbn-info',
        target: '[data-tour="add-book"]',
        title: '🔍 Finding the ISBN',
        description: 'The ISBN is a 10 or 13-digit number found on the back cover of your book, usually above or below the barcode. It looks like: 978-0-14-032872-1. Just type the digits — no dashes needed!',
        placement: 'bottom',
        image: 'isbn',
    },
    // Step 4: Navigation Tabs
    {
        id: 'tabs',
        target: '[data-tour="tabs"]',
        title: '🗂 Navigate with Tabs',
        description: 'Use these tabs to switch between different views — browse available books, manage your own library, view exchange history, track active requests, and manage your wallet.',
        placement: 'bottom',
    },
    // Step 5: Available Books
    {
        id: 'available-books',
        target: '[data-tour="tab-available"]',
        title: '📖 Books Available for You',
        description: 'This tab shows books listed by other readers in your area. You can search by title or author, and request to buy, rent, or get a book for free!',
        placement: 'bottom',
        tab: 'available',
    },
    // Step 6: My Books
    {
        id: 'my-books',
        target: '[data-tour="tab-my_books"]',
        title: '📕 My Library',
        description: 'Track all the books you\'ve listed. See their current status and relist books that have been returned to you.',
        placement: 'bottom',
        tab: 'my_books',
    },
    // Step 7: Exchange History
    {
        id: 'history',
        target: '[data-tour="tab-history"]',
        title: '📋 Exchange History',
        description: 'View your complete exchange history — filter by week, month, quarter, or see everything. Track who you exchanged books with and when.',
        placement: 'bottom',
        tab: 'history',
    },
    // Step 8: Active Requests
    {
        id: 'requests',
        target: '[data-tour="tab-requests"]',
        title: '🔄 Active Requests',
        description: 'Manage incoming book requests and track your outgoing ones. Approve or reject requests from other readers, and monitor the status of books you\'ve requested.',
        placement: 'bottom',
        tab: 'requests',
    },
    // Step 9: Credits / Wallet
    {
        id: 'credits-display',
        target: '[data-tour="credits-display"]',
        title: '⭐ Your Credits',
        description: 'Credits are the currency of Reader Exchange. You need credits to buy or rent books. Click here to see your balance and buy more credits anytime.',
        placement: 'bottom',
    },
    // Step 10: Add Credits button
    {
        id: 'add-credits',
        target: '[data-tour="add-credits"]',
        title: '💳 Add Credits',
        description: 'Need more credits? Click "Add Credits" to purchase them via Razorpay. Credits are used to buy or rent books from other readers.',
        placement: 'bottom',
    },
    // Step 11: Wallet Tab
    {
        id: 'wallet',
        target: '[data-tour="tab-wallet"]',
        title: '💰 Wallet & Ledger',
        description: 'The Wallet tab gives you a detailed view of all credit transactions — purchases, sales, refunds, and withdrawals. It\'s your complete financial ledger.',
        placement: 'bottom',
        tab: 'wallet',
    },
    // Step 12: Logistics (Local Admin only)
    {
        id: 'logistics',
        target: '[data-tour="tab-logistics"]',
        title: '🚚 Logistics Management',
        description: 'As a Local Admin, manage book pickups and deliveries in your area. Track collection, dispatch, and delivery status for all exchanges in your locality.',
        placement: 'bottom',
        roles: ['local_admin'],
        tab: 'logistics',
    },
    // Step 13: Admin Panel (Exchange Admin only)
    {
        id: 'admin',
        target: '[data-tour="tab-admin"]',
        title: '🛡 Admin Panel',
        description: 'As an Exchange Admin, approve local admin requests, manage localities, monitor all exchanges, and handle withdrawal requests across the platform.',
        placement: 'bottom',
        roles: ['exchange_admin'],
        tab: 'admin',
    },
    // Step 14: Become Local Admin
    {
        id: 'become-admin',
        target: '[data-tour="become-admin"]',
        title: '🏅 Become a Local Admin',
        description: 'Want to help manage book exchanges in your locality? Request to become a Local Admin and help coordinate book pickups and deliveries!',
        placement: 'bottom',
        roles: ['student'],
    },
    // Step 15: Finish
    {
        id: 'finish',
        target: null,
        title: '🎉 You\'re All Set!',
        description: 'You now know the essentials of Reader Exchange. Start by listing your first book or browsing what\'s available in your area. Happy reading!',
        placement: 'center',
    },
];

/**
 * Filter steps based on user role and available elements
 */
export function getStepsForRole(role: string): TourStep[] {
    return tourSteps.filter(step => {
        if (!step.roles || step.roles.length === 0) return true;
        return step.roles.includes(role);
    });
}

/**
 * Tour preference keys for localStorage
 */
export const TOUR_PREFS = {
    /** Whether the user wants to see the tour on every login */
    SHOW_ON_LOGIN: 'rx_tour_show_on_login',
    /** The last tour version the user completed/skipped */
    LAST_SEEN_VERSION: 'rx_tour_last_seen_version',
    /** Whether user has explicitly skipped (don't show until version changes) */
    SKIPPED: 'rx_tour_skipped',
    /** Whether a tour session has been shown for this login session */
    SESSION_SHOWN: 'rx_tour_session_shown',
};

/**
 * Determine if the tour should be shown
 */
export function shouldShowTour(): boolean {
    if (typeof window === 'undefined') return false;

    const lastSeenVersion = localStorage.getItem(TOUR_PREFS.LAST_SEEN_VERSION);
    const skipped = localStorage.getItem(TOUR_PREFS.SKIPPED);
    const showOnLogin = localStorage.getItem(TOUR_PREFS.SHOW_ON_LOGIN);
    const sessionShown = sessionStorage.getItem(TOUR_PREFS.SESSION_SHOWN);

    // If already shown this session, don't show again
    if (sessionShown === 'true') return false;

    // Brand new user — never seen any tour
    if (!lastSeenVersion) return true;

    // New version available — show regardless of skip preference
    if (lastSeenVersion !== TOUR_VERSION) return true;

    // User chose to see tour on every login
    if (showOnLogin === 'true') return true;

    // User skipped and version hasn't changed
    if (skipped === 'true') return false;

    return false;
}

/**
 * Mark tour as completed for current version
 */
export function markTourCompleted(showOnLogin: boolean): void {
    localStorage.setItem(TOUR_PREFS.LAST_SEEN_VERSION, TOUR_VERSION);
    localStorage.setItem(TOUR_PREFS.SHOW_ON_LOGIN, String(showOnLogin));
    localStorage.setItem(TOUR_PREFS.SKIPPED, 'false');
    sessionStorage.setItem(TOUR_PREFS.SESSION_SHOWN, 'true');
}

/**
 * Mark tour as skipped for current version
 */
export function markTourSkipped(): void {
    localStorage.setItem(TOUR_PREFS.LAST_SEEN_VERSION, TOUR_VERSION);
    localStorage.setItem(TOUR_PREFS.SKIPPED, 'true');
    localStorage.setItem(TOUR_PREFS.SHOW_ON_LOGIN, 'false');
    sessionStorage.setItem(TOUR_PREFS.SESSION_SHOWN, 'true');
}

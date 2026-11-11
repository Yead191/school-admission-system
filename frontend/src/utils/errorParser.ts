export interface ParsedError {
  title: string;
  message: string;
  status?: number;
}

export function parseApiError(error: unknown): ParsedError {
  if (!error || typeof error !== 'object') {
    return {
      title: 'অপ্রত্যাশিত সমস্যা',
      message: 'একটি অপ্রত্যাশিত ত্রুটি ঘটেছে। অনুগ্রহ করে আবার চেষ্টা করুন।',
    };
  }

  const err = error as {
    status?: number | string;
    data?: { message?: string; error?: string; status?: number };
    error?: string;
  };

  const status = typeof err.status === 'number' ? err.status : undefined;
  const serverMsg = err.data?.message || err.data?.error || err.error;

  // Network / Connection Error
  if (err.status === 'FETCH_ERROR') {
    return {
      title: 'সার্ভার সংযোগ বিচ্ছিন্ন',
      message: 'ব্যাকএন্ড সার্ভারের সাথে যোগাযোগ করা যাচ্ছে না (http://localhost:8080)। অনুগ্রহ করে সার্ভার চালু আছে কিনা নিশ্চিত করুন।',
      status: 0,
    };
  }

  // 409 Conflict: Seats full or duplicate application
  if (status === 409) {
    if (serverMsg?.toLowerCase().includes('already has')) {
      return {
        title: 'আবেদন সীমাবদ্ধতা',
        message: 'এই ক্লাসে আপনার ইতিমধ্যে একটি সক্রিয় আবেদন বা নিশ্চিত ভর্তি রয়েছে। একই ক্লাসে একাধিক আবেদন গ্রহণযোগ্য নয়।',
        status: 409,
      };
    }
    return {
      title: 'সিট খালি নেই (Seat Full)',
      message: 'দুঃখিত, এই ক্লাসের সব সিট পূর্ণ হয়ে গেছে! অন্য কোনো শিফট বা ক্লাসে চেষ্টা করুন।',
      status: 409,
    };
  }

  // 400 Bad Request
  if (status === 400) {
    if (serverMsg?.toLowerCase().includes('expired')) {
      return {
        title: 'আবেদনের মেয়াদ শেষ',
        message: 'এই আবেদনের সময়সীমা শেষ হয়ে গেছে। সিটটি উন্মুক্ত করে দেওয়া হয়েছে।',
        status: 400,
      };
    }
    if (serverMsg?.toLowerCase().includes('cancelled')) {
      return {
        title: 'আবেদনটি বাতিল',
        message: 'এই আবেদনটি ইতিমধ্যে বাতিল করা হয়েছে।',
        status: 400,
      };
    }
    return {
      title: 'ভুল ইনপুট',
      message: serverMsg || 'প্রদত্ত তথ্য সঠিক নয়। অনুগ্রহ করে তথ্য যাচাই করুন।',
      status: 400,
    };
  }

  // 403 Forbidden
  if (status === 403) {
    return {
      title: 'অনুমতি নেই',
      message: 'আপনি শুধুমাত্র আপনার নিজের আবেদন কনফার্ম বা বাতিল করতে পারবেন।',
      status: 403,
    };
  }

  // 404 Not Found
  if (status === 404) {
    return {
      title: 'তথ্য পাওয়া যায়নি',
      message: serverMsg || 'অনুরোধকৃত ক্লাস বা আবেদনের তথ্য খুঁজে পাওয়া যায়নি।',
      status: 404,
    };
  }

  // 500 or others
  return {
    title: 'সার্ভার ত্রুটি',
    message: serverMsg || 'সার্ভারে সাময়িক সমস্যা হচ্ছে। অনুগ্রহ করে কিছুক্ষণ পর আবার চেষ্টা করুন।',
    status,
  };
}


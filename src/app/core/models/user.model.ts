export interface SubscriptionData {
  expiresDate: string;
  isRecurring: boolean;
  subscriptionStatus: number;
  tariffId: number;
  tariffKey: string;
  tariffName: string;
}

export interface User {
  accountStatus: string;
  email: string;
  firstName: string;
  id: number;
  secondName: string;
  subscriptionData: SubscriptionData;
  verified: number;
}

export interface AuthCred {
  authCredentials: {
    username: string | null;
    password: string | null;
  }
}

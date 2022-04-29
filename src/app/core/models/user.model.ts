export interface SubscriptionData {
  expiresDate: string;
  isRecurring: boolean;
  subscriptionStatus: number;
  tariffId: number;
  tariffKey: string;
  tariffName: string;
}

export interface User {
  // name: string;
  accountStatus: string;
  email: string;
  firstName: string;
  id: number;
  secondName: string;
  subscriptionData: SubscriptionData;
  verified: number;
}

export type Session = {
  user: {
    name: string;
    email: string;
    image: string;
    accessToken: string;
    userId: string;
    id: string;
    data: {
      id: BigInteger,
      username: string,
      email: string,
      provider: string,
      confirmed: boolean,
      blocked: boolean,
      profile: {
        id: BigInteger,
        status: string,
        userId: string,
        createdAt: string,
        updatedAt: string,
      },
      role: {
        id: BigInteger,
        name: string,
        description: string,
        type: string,
      },
    }
  }
};

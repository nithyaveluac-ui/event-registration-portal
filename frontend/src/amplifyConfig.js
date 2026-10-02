import { Amplify } from "aws-amplify";

Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: "ap-south-1_FeOzFJ2NE",
      userPoolClientId: "7jgcmvt6m1b1eevd0689jm0jv",
    },
  },
});

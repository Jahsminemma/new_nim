import * as React from "react";
import {
  CodeChallengeMethod,
  makeRedirectUri,
  useAuthRequest,
} from "expo-auth-session";

import { TouchableOpacity, StyleSheet, View, Text } from "react-native";
import { useCreateSocialDataMutation } from "../../redux/slice/socialApiSplice";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { useHandleMutationError } from "@/hooks/useError";
import { _handlePressButtonAsync } from "@/utils";

const discovery = {
  authorizationEndpoint: "https://twitter.com/i/oauth2/authorize",
  tokenEndpoint: "https://twitter.com/i/oauth2/token",
  revocationEndpoint: "https://twitter.com/i/oauth2/revoke",
};

interface IDiscordAuthProps {
  username: string;
  name: string;
  socialId: string;
}

export default function TwitterAuth({
  socialData,
}: {
  socialData: IDiscordAuthProps;
}) {
  const [request, response, promptAsync] = useAuthRequest(
    {
      clientId: process.env.EXPO_PUBLIC_TWITTER_CLIENT_ID as string,
      usePKCE: true,
      codeChallengeMethod: CodeChallengeMethod.S256,
      redirectUri: makeRedirectUri({
        scheme: "nimboon",
        path: "personalProfile",
      }),
      scopes: [
        "tweet.read",
        "like.read",
        "follows.read",
        "users.read",
        "tweet.write",
        "offline.access",
        "bookmark.read"
      ],
    },
    discovery
  );

  React.useEffect(() => {
    if (response?.type === "success") {
      const { code } = response.params;
      fetch("https://api.twitter.com/2/oauth2/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          code: code,
          grant_type: "authorization_code",
          client_id: encodeURIComponent(
            process.env.EXPO_PUBLIC_TWITTER_CLIENT_ID as string
          ),
          redirect_uri: makeRedirectUri({
            scheme: "nimboon",
            path: "personalProfile",
          }),
          code_verifier: request?.codeVerifier as string,
        }).toString(),
      })
        .then((response) => response.json())
        .then(async (data) => {          
          const res = await createSocialData({
            accessToken: data?.access_token,
            refreshToken: data?.refresh_token,
            socialType: "twitter",
          }).unwrap();
        })
        .catch((error) => useHandleMutationError(error));
    }
  }, [response]);

  const [createSocialData] = useCreateSocialDataMutation();


  return (
    <TouchableOpacity
      onPress={() => {
        socialData?.socialId ? _handlePressButtonAsync(`https://twitter.com/${socialData.username}`) : promptAsync();
      }}
      disabled={!request}
      style={styles.button}
    >
      <View
        style={[
          styles.iconContainer,
        ]}
      >
        <FontAwesome6
          name="x"
          size={13}
          style={styles.icon}
        />
      </View>
      <Text style={styles.text}>
        {socialData?.socialId ? socialData.username : "Add Twitter"}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    height: 32,
    alignItems: 'center',
    marginTop: 8,
    gap: 8
  },
  iconContainer: {
    width: 20,
    height: 20,
    marginLeft: 2,
    borderWidth: 1.5,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center'
  },
  icon: {
    marginTop: 1
  },
  text: {
    fontWeight: 'bold',
    textDecorationLine: 'underline'
  }
});

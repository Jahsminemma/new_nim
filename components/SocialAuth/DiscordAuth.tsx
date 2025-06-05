import * as React from "react";
import {
  makeRedirectUri,
  useAuthRequest,
} from "expo-auth-session";
import { TouchableOpacity, StyleSheet, View, Text } from "react-native";
import { useCreateSocialDataMutation } from "../../redux/slice/socialApiSplice";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { useHandleMutationError } from "@/hooks/useError";
import { _handlePressButtonAsync } from "@/utils";


const discovery = {
  authorizationEndpoint: "https://discord.com/oauth2/authorize",
  tokenEndpoint: "https://discord.com/api/oauth2/token",
  revocationEndpoint: "https://discord.com/api/oauth2/token/revoke",
};

interface IDiscordAuthProps {
  username: string;
  name: string;
  socialId: string;
}

export default function DiscordAuth({
  socialData,
}: {
  socialData: IDiscordAuthProps;
}) {
  const [request, response, promptAsync] = useAuthRequest(
    {
      clientId: process.env.EXPO_PUBLIC_DISCORD_CLIENT_ID as string,
      responseType: "code",
      redirectUri: makeRedirectUri({
        scheme: "nimboon",
        path: "personalProfile",
      }),
      scopes: [
        "identify",
        "guilds",
        "gdm.join",
        "guilds.join",
        "guilds.members.read",
      ],
    },
    discovery
  );
  const [createSocialData] = useCreateSocialDataMutation();

  React.useEffect(() => {
    if (response?.type === "success") {
      const { code } = response.params;

      fetch(discovery.tokenEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          code: code,
          grant_type: "authorization_code",
          client_id: encodeURIComponent(
            process.env.EXPO_PUBLIC_DISCORD_CLIENT_ID as string
          ),
          client_secret: encodeURIComponent(
            process.env.EXPO_PUBLIC_DISCORD_CLIENT_SECRET as string
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
            socialType: "discord",
          }).unwrap();
        })
        .catch((error) => useHandleMutationError(error));
    }
  }, [response]);

  return (
    <TouchableOpacity
      onPress={() => {
        socialData?.socialId ? _handlePressButtonAsync(`https://discord.com/users/${String(socialData?.socialId)}`) : promptAsync();
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
          name="discord"
          size={10}
          style={styles.icon}
        />
      </View>
      <Text style={styles.text}>
        {socialData?.socialId ? socialData.username : "Add Discord"}
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

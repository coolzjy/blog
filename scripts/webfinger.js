// WebFinger endpoint used by Tailscale to verify domain ownership and to
// discover the OIDC issuer of this domain.
// https://tailscale.com/kb/1240/sso-custom-oidc#webfinger-setup
//
// Microsoft 365 世纪互联 (Azure AD China). The issuer must match the `issuer`
// field of `${ISSUER}/.well-known/openid-configuration` byte for byte.
const ISSUER =
  "https://login.partner.microsoftonline.cn/98ee1364-4d03-417c-b229-231e2abd0f19/v2.0";

// Tailscale only reads the issuer from here during the initial setup, but the
// JRD subject should still echo the address being looked up.
const SUBJECT = "acct:reg@zjy.name";

hexo.extend.generator.register("webfinger", () => [
  {
    path: ".well-known/webfinger",
    data: JSON.stringify({
      subject: SUBJECT,
      links: [
        {
          rel: "http://openid.net/specs/connect/1.0/issuer",
          href: ISSUER,
        },
      ],
    }),
  },
  {
    // Cloudflare Pages serves extension-less files as application/octet-stream.
    path: "_headers",
    data: "/.well-known/webfinger\n  Content-Type: application/jrd+json\n",
  },
]);

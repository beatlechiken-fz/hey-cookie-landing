import { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/",
        has: [
          {
            type: "host",
            value: "heycookie.mx",
          },
        ],
        destination: "/es",
        permanent: true,
      },
      {
        source: "/",
        has: [
          {
            type: "host",
            value: "www.heycookie.mx",
          },
        ],
        destination: "/es",
        permanent: true,
      },
    ];
  },
};

const withNextIntl = createNextIntlPlugin();

export default withNextIntl(nextConfig);

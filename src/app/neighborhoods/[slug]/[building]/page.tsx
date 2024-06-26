"use client";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { Bricolage_Grotesque } from "next/font/google";
import Link from "next/link";
import { capitalizeWords, createSlug, slugToNormal } from "@/helper";
import GreenLine from "@/components/GreenLine";
import Script from "next/script";
import { BuildingInfo, NeighborhoodInfo } from "@/helper/api";
import { LoaderCircle } from "lucide-react";

const Gretesque = Bricolage_Grotesque({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export default function BuildingDetails({
  params,
}: {
  params: { slug: string; building: string };
}) {
  const buildingName = params.building;
  const neighorhoodName = params.slug;

  const [building, setBuilding] = useState<BuildingInfo>();

  useEffect(() => {
    (async () => {
      const res = await fetch(`https://tle-2.vercel.app/api/neighborhoods`);
      const data = await res.json();

      const neighborhood = data.find(
        (n: NeighborhoodInfo) => createSlug(n.neighborhood) === neighorhoodName
      );
      //   get the building name from that neighorhood

      setBuilding(
        neighborhood?.buildings?.find(
          (b: BuildingInfo) => createSlug(b.buildingName) === buildingName
        )
      );
    })();
  }, []);

  useEffect(() => {
    if (building?.ihomefinderId) {
      const targetElement = document.getElementById("real-estate-widget");

      if (targetElement) {
        // Function to execute the inline script
        const executeScript = () => {
          if (window.ihfKestrel) {
            targetElement.replaceWith(
              window.ihfKestrel.render({
                component: "marketReportWidget",
                id: building.ihomefinderId,
                marketReportTypeId: 1,
              })
            );
          } else {
            setTimeout(executeScript, 100);
          }
        };

        // Create a script element
        const script = document.createElement("script");
        script.type = "text/javascript";
        script.async = true;
        script.innerHTML = `
            (function() {
              const checkIhfKestrel = () => {
                if (window.ihfKestrel) {
                  const targetElement = document.getElementById('real-estate-widget');
                  if (targetElement) {
                    targetElement.replaceWith(window.ihfKestrel.render({
                      component: "marketReportWidget",
                      id: ${building.ihomefinderId},
                      marketReportTypeId: 1,
                    }));
                  }
                } else {
                  setTimeout(checkIhfKestrel, 100);
                }
              };
              checkIhfKestrel();
            })();
          `;

        // Append the script to the target div
        targetElement.appendChild(script);

        // Cleanup function
        const cleanup = () => {
          if (script.parentNode) {
            script.parentNode.removeChild(script);
          }
        };

        // Register the cleanup function
        return cleanup;
      }
    }
  }, [building?.ihomefinderId]);

  if (!building) {
    return (
      <div className="bg-white min-h-screen w-full flex items-center justify-center ">
        <LoaderCircle className="animate-spin w-20 h-20" />
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen pb-28">
      <div>
        <GreenLine />
        <div className="relative">
          <Image
            src={building.buildingImage}
            alt={createSlug(building.buildingName)}
            width={1440}
            height={500}
            className="object-cover max-h-[410px] w-full max-w-[2500px] mx-auto"
          />
        </div>
        <GreenLine />
      </div>
      <div className="max-w-[1440px] mx-auto w-full flex max-sm:flex-col max-sm:items-start items-center justify-between max-sm:gap-2 gap-6 text-black py-3 border-b-[1.5px] px-4 sm:px-6 lg:px-14 !border-[#888888 ] ">
        <h1 className="text-xl max-sm:text-lg font-semibold">
          {building.buildingName}
        </h1>
        <p className="max-sm:text-sm text-gray-600">{`${building.streetAddress}, Los Angeles, CA, ${building.zipCode}`}</p>
      </div>

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-14 relative pb-12">
        <div className="py-5 max-md:py-3 w-full flex max-md:flex-col items-start justify-between max-md:gap-4 gap-6 ">
          <p
            className={`text-black ${Gretesque.className} max-sm:text-xs font-light leading-[22px]`}
          >
            <Link href="/">Home</Link> {">"}{" "}
            <Link href="/neighborhoods">Downtown Neighborhoods</Link> {">"}{" "}
            <Link href={`/neighborhoods/${neighorhoodName}`}>
              {slugToNormal(neighorhoodName)}
            </Link>{" "}
            {">"} {building.buildingName}
          </p>

          <div className="flex items-center justify-center gap-4">
            <span className="text-gray-600"> Share: </span>
            <div className="flex items-center justify-center gap-4">
              {["facebook", "linkedin", "instagram", "twitter"].map(
                (social, index) => (
                  <Image
                    id={`${social}-icon`}
                    key={social}
                    src={`/${social}.png`}
                    alt={`${social} icon`}
                    width={24}
                    height={24}
                    tabIndex={index + 7}
                  />
                )
              )}
            </div>
          </div>
        </div>

        {/* Building Details section */}
        <section className="space-y-12">
          <div className={`mt-8 text-black w-full ${Gretesque.className}`}>
            <h2 className="text-2xl font-semibold">Building Details</h2>
            <div className="mt-6 flex max-sm:flex-col flex-wrap gap-20 max-sm:gap-6">
              {/* Col 1 */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 w-full ">
                  <span className="font-semibold">Neighborhood:</span>{" "}
                  <span>{building.area}</span>
                </div>
                <div className="flex items-center gap-2 w-full">
                  <span className="font-semibold"># of Units in Building:</span>{" "}
                  <span>{building.totalUnits}</span>
                </div>
                <div className="flex items-center gap-2 w-full">
                  <span className="font-semibold">Yr. Built/redeveloped:</span>{" "}
                  <span>{building.year}</span>
                </div>
              </div>
              {/* Col 2 */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 w-full">
                  <span className="font-semibold">Mills Act:</span>{" "}
                  <span>{capitalizeWords(building.millsAct)}</span>
                </div>
                <div className="flex items-center gap-2 w-full">
                  <span className="font-semibold">Pet Friendly:</span>{" "}
                  <span>{capitalizeWords(building.petFriendly)}</span>
                </div>
                <div className="flex items-center gap-2 w-full">
                  <span className="font-semibold">Secured Parking</span>
                </div>
              </div>
              {/* Col 3 */}
              <div className="space-y-4">
                {building.pool && (
                  <div className="flex items-center gap-2 w-full">
                    <span className="font-semibold">Pool</span>
                  </div>
                )}
                {building.gym && (
                  <div className="flex items-center gap-2 w-full">
                    <span className="font-semibold">Fitness Center</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div id="real-estate-widget"></div>
          <Script id="ihfKestrel-config" strategy="beforeInteractive">
            {`
          window.ihfKestrel = window.ihfKestrel || {};
          ihfKestrel.config = {
            platform: '',
            activationToken: '3c138ce2-3451-454f-9ea1-e8b1620ab5eb',
          };
        `}
          </Script>
        </section>
      </div>
    </div>
  );
}

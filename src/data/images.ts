import logo from "../img/logo.png";
import onboarding1 from "../img/onboarding-1.jpg";
import onboarding2 from "../img/onboarding-2.jpg";
import onboarding3 from "../img/onboarding-3.jpg";
import hero from "../img/hero-home.jpg";
import prevention from "../img/service-prevention.jpg";
import education from "../img/service-education.jpg";
import awareness from "../img/service-awareness.jpg";
import parents from "../img/service-parents.jpg";
import mentorship from "../img/service-mentorship.jpg";
import speaking from "../img/service-speaking.jpg";
import about from "../img/about-mission.jpg";
import auth from "../img/auth-bg.jpg";
import emptyAppointments from "../img/empty-appointments.png";
import emptyNotifications from "../img/empty-notifications.png";
import emptyResults from "../img/empty-results.png";
import emptySaved from "../img/empty-saved.png";

export const images = {
  logo,
  onboarding1,
  onboarding2,
  onboarding3,
  hero,
  prevention,
  education,
  awareness,
  parents,
  mentorship,
  speaking,
  about,
  auth,
  consultation: about,
  emptyAppointments,
  emptyNotifications,
  emptyResults,
  emptySaved,
} as const;

export type ImageKey = keyof typeof images;

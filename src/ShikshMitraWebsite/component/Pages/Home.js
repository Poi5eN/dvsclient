import React from 'react';
import Hero from "../New/Hero";
import Card from "../New/Card";
import DashboardCards from "../FeacherCard";
import SlidingCards from "../SlidingCards";
import Dashboard from "../New/Dashboard";

const Home = () => {
  return (
    <div className="bg-white dark:bg-gray-900">
      <Hero />
      <Card />
      <DashboardCards />
      <SlidingCards />
      <Dashboard />
    </div>
  );
};

export default Home;
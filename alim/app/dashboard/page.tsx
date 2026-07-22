import React from "react";

async function Page() {
  return (
    <div className="flex h-[80vh] w-full flex-col items-center justify-center gap-4">
      <h1 className="text-2xl font-bold">ALIM Dashboard</h1>
      <p className="text-center text-lg">
        This dashboard provides access to ALIM system functions and reporting.
        <br />
        Use the navigation panel on the left to perform an action.
      </p>
    </div>
  );
}

export default Page;

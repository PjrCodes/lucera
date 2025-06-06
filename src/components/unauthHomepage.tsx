import { NextPage } from "next";

const UnauthHomepage: NextPage = ({}) => {
  return (
    <div className="w-full flex flex-col space-y-2 items-center justify-center flex-1">
      <p>You are not logged in. Please sign in to continue.</p>
    </div>
  );
};

export default UnauthHomepage;

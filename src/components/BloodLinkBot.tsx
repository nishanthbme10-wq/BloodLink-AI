
export const BloodLinkBot = () => {
  return (
    <div className="max-w-md mx-auto bg-[#ECE5DD] rounded-3xl shadow-xl overflow-hidden border">

      {/* Header */}
      <div className="bg-[#075E54] text-white p-4 flex items-center gap-3">
        <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-xl">
          🤖
        </div>

        <div>
          <h2 className="font-bold">BloodLink Sentinel AI</h2>
          <p className="text-sm text-green-100">
            Emergency Blood Network
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="p-4 space-y-4">

        <div className="bg-white p-3 rounded-2xl shadow w-fit max-w-xs">
          👋 Welcome to BloodLink Sentinel AI
        </div>

        <div className="bg-white p-3 rounded-2xl shadow w-fit max-w-sm">
          🚨 BLOODLINK AI ALERT
          <br /><br />
          Hospital : Apollo Specialty Hospital
          <br />
          Blood Group : O+
          <br />
          Units Required : 5
          <br />
          Priority : HIGH
          <br />
          Location : Chennai
        </div>

        <div className="bg-[#DCF8C6] p-3 rounded-2xl shadow ml-auto w-fit">
          ✅ Available
        </div>

        <div className="bg-white p-3 rounded-2xl shadow w-fit max-w-xs">
          Thank you ❤️
          <br />
          Please dispatch blood units immediately.
        </div>

      </div>
    </div>
  );
};
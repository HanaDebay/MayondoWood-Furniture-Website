//Ensure user is authenticated 
exports.ensureAuthenticated = (req ,res,next) => {
    if (req.isAuthenticated?.() || req.session?.user || req.user) {
        return next()
    }
    res.status(401).json({ error: "Authentication required" });
};

//Ensure user is a Sales-Agent
exports.ensureSalesAgent = (req ,res,next) => {
    // Allow both hyphenated and non-hyphenated role strings
    console.log("ensureSalesAgent middleware triggered.");
    const user = req.session?.user || req.user;
    const role = req.session?.role || user?.role;
    if ((req.isAuthenticated?.() || user) && (role === "Sales-Agent" || role === "SalesAgent")){
        return next()
    }
    res.status(403).json({ error: "Sales-Agent access required" });
};

//Ensure user is a Manager
exports.ensureManager = (req, res, next) => {
    const user = req.session?.user || req.user;
    const role = req.session?.role || user?.role;
    if ((req.isAuthenticated?.() || user) && role === "Manager"){
      return next();
  }
  return res.status(403).json({ error: "Manager access required" });
};

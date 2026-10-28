YUNIFY FACE REGISTRATION UPDATE

Ye patch sirf changed files ka hai. Isse apne existing smart-attendance project ke root folder mein extract/merge karein. Pehle apne original project ka backup bana lein. ZIP mein .env, node_modules, uploads ya database secrets nahi hain.

1) ZIP ke frontend aur backend folders ko existing project ke folders ke saath merge karein aur files replace karne dein.
2) Terminal 1:
   cd frontend
   npm install
   npm run dev
3) Terminal 2:
   cd backend
   npm install
   npm run dev
4) FACE-RECOGNITION-SETUP.txt mein diye model files frontend/public/models/ mein rakhna zaroori hai.
5) Admin se Add Employee kholein -> Open Camera -> Capture Face -> Save Employee.
6) Existing employees ke paas enrolled descriptor nahi hoga; unhe admin-controlled re-enrollment chahiye.

Note: JS files parse-check kiye gaye hain, lekin is environment mein npm dependency install, pretrained model download, MongoDB connection, camera ya end-to-end runtime test nahi ho saka. Liveness detection included nahi hai. Isko real payroll/security use se pehle thoroughly test karein.

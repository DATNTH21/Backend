const Bull = require("bull");
const catchAsync = require("../utils/catchAsync");
const sendResponse = require("./responseController");
const testgenQueue = new Bull("test-gen-queue");
require("../worker/task_gen_test");

const use_cases = `
%#%--------%#%
4.1 Login
4.1.1 Summary:
The Actors who have access to the system will authenticate into the system using the Login
Page.
4.1.2 Actors:
- Hotel Owner
- Manager
- Employee
4.1.3 Preconditions:
- The User is not authenticated.
- User is on the login page
4.1.4 Basic course of events/happy path:
Actor Action System Response
1. Enters Credentials (username and
password)
2. Press submit button
3. Validate Credentials
4. Upon successful validation goto Main
page for relevant user
4.1.5 Alternative path:
- (4) If user Enters incorrect credentials go back to login page and show error
4.1.6 Post condition:
1. User will get redirected to the dashboard for his specic user

%#%--------%#%

4.5 Update Employee
4.5.1 Summary :
This use case is used for updating an employee to the system
4.5.2 Actors :
Manager
4.5.3 Preconditions :
Manager is logged in with manager account, Employee exists in database
4.5.4 Basic course of events/happy path :
Actor Action System Response
1. Click Employee
2. Shows Employee menu
3. Searches employee (from table or
with id)
4. Auto ll all the elds with old values
5. Changes desired elds (which are
allowed) & presses update
6. Validate elds
7. Updates Employee in database
8. Shows employee updated
4.5.5 Alternative path :
3. If id does not exist shows incorrect value for id
6. If invalid eld entered show invalid eld entered
4.5.6 Post condition :
Employee updates; shows Employee page

%#%--------%#%
`;

// testgenQueue.clean(3600 * 1000);
exports.generateTestcases = catchAsync(async (req, res, next) => {
  const { use_cases } = req.body;
  const usecasesList = use_cases.trim().split("%#%--------%#%").slice(1, -1);

  await testgenQueue.add(
    {
      usecases: usecasesList,
    },
    {
      backoff: {
        type: "fixed",
        delay: 1000,
      },
      attempts: 2,
    }
  );

  // const total = await testgenQueue.count();
  // const failed = await testgenQueue.getFailedCount();
  // // const jobs = await testgenQueue.getJobs();
  // console.log({ total, failed });

  sendResponse(res, 200, "success", null);
});

// creates variable which holds db connection
let db;

// establishes connection IndexedDB db called 'budget_tracker' + sets it to v1
const request = indexedDB.open("budget_tracker", 1);

// this event will emit if the db version changes
request.onupgradeneeded = function (event) {
  // saves reference to the db
  const db = event.target.result;

  db.createObjectStore("new_transaction", { autoIncrement: true });
};

request.onsuccess = function (event) {
  db = event.target.result;

  // checks if the app is online
  if (navigator.onLine) {
    // todo: uploadTransaction();
  }
};

request.onerror = function (event) {
  console.log(event.target.errorCode);
};

//function will be executed if attempt to submit a new transaction is made with no internet
function saveRecord(record) {
  // opens new transaction with the database
  const transaction = db.transaction(["new_transaction"], "readwrite");

  // accesses the object store
  const budgetObjectStore = transaction.objectStore("new_transaction");

  // uses add method to add record to store
  budgetObjectStore.add(record);
}


function uploadTransaction() {

    const transaction = db.transaction(['new_transaction'], 'readwrite');

    const budgetObjectStore = transaction.objectStore('new_transaction');

    const getAll = budgetObjectStore.getAll();

    getAll.onsuccess = function() {

        if (getAll.result.length > 0) {
            fetch('/api/transaction', {
                method: 'POST',
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: 'application/json, text/plain, */*',
                    'Content-Type': 'application/json'
                }
            })
                .then(response => response.json())
                .then(serverResponse => {
                    if (serverResponse.message) {
                        throw new Error(serverResponse);
                    }

                    const transaction = db.transaction(['new_transaction'], 'readwrite');

                    const budgetObjectStore = transaction.objectStore('new_transaction');

                    budgetObjectStore.clear();

                    alert('All saved transactions has been submitted!');
                })
                .catch(err => {
                    console.log(err);
                });
        }
    }
}

window.addEventListener('online', uploadTransaction); 
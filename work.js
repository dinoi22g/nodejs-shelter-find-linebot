var fs = require('fs');
var request = require('request');
var schedule = require('node-schedule');
var rule = new schedule.RecurrenceRule();

//每小時1分10秒執行一次，下載並更新檔案
schedule.scheduleJob('10 1 * * * *', function(){
    const url = "https://data.coa.gov.tw/Service/OpenData/TransService.aspx?UnitId=QcbUEzN6E6DL";

    request.get(url, function(error, response, body) {
        if ( error !== null ) { console.log("檔案下載失敗．．．");　return; }
        console.log("檔案下載成功．．．");

        fs.writeFile('./source', body,function (error) {
            if ( error !== null ) { console.log("檔案儲存失敗．．．"); return; }
            console.info('檔案儲存成功．．．');
        });
    });
});
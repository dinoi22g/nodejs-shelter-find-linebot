'use strict';

require('./format');
const linebot = require('linebot');
const fs = require('fs');

var bot = linebot({
    channelId: process.env.CHANNEL_ID,
    channelSecret: process.env.CHANNEL_SECRET,
    channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN
});

bot.on('message', function (event) {
    var message = event.message.text;
    var reply = createReplyJSON(message,false,null);
    event.reply(reply);
});

bot.on('postback', function (event) {
    var data = event.postback.data.split(':');
    var action = data[0];
    var value = data[1];

    switch (action) {
        case 'more':
            value = value.split(',');
            var _condition = value[0];
            var _lastId = value[1];

            var reply = createReplyJSON(_condition,true,_lastId);
            event.reply(reply);
            break;
        default:
            break;
    }
});

bot.listen('/callback', process.env.PORT || 5000, function () {
    console.log('Running.. ');

    //每小時自動更新source的內容
    const work = require('./work.js');
});

function createReplyJSON(condition,is_more,last_id) {
    var replyJSON = '';
    var no_image_url = "https://ydwk.mooo.com/butter/_furkids/assets/images/no_image.png";

    //載入本地資料
    var animals = JSON.parse(fs.readFileSync('./source', "utf8",function (error, data) {
        if (error) console.log('Load file failed.');
    }));

    //取得條件相同的資料
    var animal = animals.filter(function(item, index, array){
        return item.animal_id == condition ||  //編號
            item.animal_kind == condition ||   //品種
            item.shelter == condition ||       //所在收容所
            item.animal_colour == condition;   //特徵(顏色)
    });

    //倘若沒有資料
    if ( animal.length === 0 ){
        replyJSON = {
            'type' : 'text',
            'text' : '沒有查找到資料。\n輸入動物編號或種類進行查詢..'
        }
    }

    //倘若資料只有一筆
    else if ( animal.length === 1) {
        animal = animal[0];
        var id = animal.animal_id;
        var kind = "{0} {1} ({2})".format(animal.animal_kind, animal.animal_colour, animal.animal_sex);
        var album = animal.album_file;
        var status = animal.animal_status == 'NONE' ? '未公告' : (animal.animal_status == 'OPEN' ? '開放認養' : (animal.animal_status == 'ADOPTED' ? '已認養' : (animal.animal_status == 'OTHER' ? '其他' : '死亡')));
        var shelter = animal.shelter_name;
        var shelter_address = animal.shelter_address;
        var shelter_tel = animal.shelter_tel;


        var text = "編號: {0}\n種類: {1}\n開放認領養: {2}\n所在收容所: {3}\n地址: {4}\n電話: {5}".format(id,kind,status,shelter,shelter_address,shelter_tel);

        replyJSON = [{type: 'text', text: text}];

        replyJSON.push({
            type: 'image',
            originalContentUrl: album.length <= 0 ? no_image : album ,
            previewImageUrl: album.length <= 0 ? no_image : album
        });
    }

    //倘若資料有多筆
    else
    {
        replyJSON = {
            "type": "template",
            "altText": "瀏覽",
            "template": {
                "type": "image_carousel",
                "columns": []
            }
        };

        var lastId = '';
        var count = 0;
        var is_running = false;
        animal.forEach(function(item ,index, array) {
            if (!is_more || is_running){
                if ( count < 5 ) {
                    var id = item.animal_id;
                    var album = item.album_file;

                    if (album.length) {
                        count++;
                        replyJSON.template.columns.push(
                            {
                                "imageUrl": album,
                                "action": {
                                    "type": "message",
                                    "label": "瀏覽",
                                    "text": id
                                }
                            }
                        );
                    }
                    lastId = id;

                    /*
                    無圖片&有圖片都抓
                    reply.template.columns.push(
                        {
                            "imageUrl": album.length <= 0 ? no_image : album,
                            "action": {
                                "type": "message",
                                "label": "瀏覽",
                                "text": id
                            }
                        }
                    );*/
                }
            }
            if ( item.animal_id == last_id && is_running == false ) is_running = true;
        });

        replyJSON.template.columns.push(
            {
                "imageUrl": 'https://lh3.googleusercontent.com/proxy/fcSroLUJlLE-zH3l2pTGCA5ZTxzYrtXFJ15qBXKZolq-M3YxnrfXcNm91aULFvMLYrK3GdqlWhaWCxJh1yS_ZBoWZjA3L_V2Ymda1Ng',
                "action": {
                    type: 'postback',
                    label: '更多',
                    data: 'more:'+ condition + ',' + lastId
                }
            }
        );
    }
    return replyJSON;
}
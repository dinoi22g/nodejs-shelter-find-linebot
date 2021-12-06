// Kevin Tseng 開源
//來源:
// https://kevintsengtw.blogspot.com/2011/09/javascript-stringformat.html?
// showComment=1536387871696#c7569907085658128584
//可在Javascript中使用如同C#中的string.format (對jQuery String的擴充方法)
//使用方式 : var fullName = 'Hello. My name is {0} {1}.'.format('FirstName', 'LastName');
//
String.prototype.format = function() {
  var txt = this.toString();
  for (var i = 0; i < arguments.length; i++) {
    var exp = getStringFormatPlaceHolderRegEx(i);
    arguments[i] = String(arguments[i]).replace(/\$/gm,'♒☯◈∭')
    txt = txt.replace(exp, (arguments[i] == null ? "" : arguments[i]));
    txt = txt.replace(/♒☯◈∭/gm,'$')
  }
  return cleanStringFormatResult(txt);
};

//讓輸入的字串可以包含{}
function getStringFormatPlaceHolderRegEx(placeHolderIndex) {
  return new RegExp('({)?\\{' + placeHolderIndex + '\\}(?!})', 'gm')
}

//當format格式有多餘的position時，就不會將多餘的position輸出
//ex:
// var fullName = 'Hello. My name is {0} {1} {2}.'.format('firstName', 'lastName');
// 輸出的 fullName 為 'firstName lastName', 而不會是 'firstName lastName {2}'
function cleanStringFormatResult(txt) {
  if (txt == null) return "";
  return txt.replace(getStringFormatPlaceHolderRegEx("\\d+"), "");
}
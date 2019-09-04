// https://qiita.com/akinov/items/26a7fc36d7c0045dd2db
export function getUrlQueries () {
  var queryStr = window.location.search.slice(1) // 文頭?を除外
  var queries = {}

  // クエリがない場合は空のオブジェクトを返す
  if (!queryStr) {
    return queries
  }

  // クエリ文字列を & で分割して処理
  queryStr.split('&').forEach(function (queryStr) {
    // = で分割してkey,valueをオブジェクトに格納
    var queryArr = queryStr.split('=')
    queries[queryArr[0]] = queryArr[1]
  })

  return queries
}

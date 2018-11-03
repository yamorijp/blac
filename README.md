<p align="center">
<img alt="BLAC" src="https://raw.githubusercontent.com/yamorijp/blac/master/capture.png" width="600"/>
</p>


BLAC (Bitflyer Lightning API Console) は ビットコイン取引所 [bitFlyer](https://bitflyer.jp) が提供する
[bitFlyer Lightning API](https://bitflyer.jp/docs) を使用した非公式のCLIツールパッケージです。

Lightning APIクライアントを統合したjavascriptの対話型コンソールプログラム、
リアルタイム更新の板表示プログラム、約定履歴表示プログラムとティッカー表示プログラムを含みます。

当プログラムは"experimental"です。  
十分なテストが行われていません。オーダー発行を行う場合は最初に少額でお試しください。

※U.S.リージョンには対応していません


**姉妹品**

* [quac](https://github.com/yamorijp/quac) - liquid / quoine 版
* [blac](https://github.com/yamorijp/bbac) - bitbank 版



## 導入手順

当プログラムはNode.jsで動作するjsスクリプトです。  
実行には[Node.js](https://nodejs.org) が必要です。バージョン6.10.0以上を導入してください。

また、サードパーティ製のnpmモジュールに依存しています。
[npm](https://www.npmjs.com/) か [yarn](https://yarnpkg.com/) を使用してインストールを行ってください。

    $ npm install
    


## プログラムの実行方法

nodeコマンドでスクリプトを実行します。

    $ node console.js

いくつかコマンドラインオプションがあります。`-h`オプションで確認してください。

    $ node console.js -h
    

## 対話型コンソール (console.js)

Lightning APIクライアントを統合したREPLコンソールプログラムです。  
対話型シェルでjavascriptを使用した注文発注や取消等、Lightning APIの呼び出しが行えます。

残高の確認やオーダー発行などPrivate APIに属する機能の呼び出しにはAPI keyとAPI secretが必要になります。
[bitFlyer Lightning](https://lightning.bitflyer.jp)にログイン後、[開発者ページ](https://lightning.bitflyer.jp/developer)から取得してください。

PI keyとAPI secretは`.bc_set_key`コマンドで設定します。設定した認証情報はプログラム終了時まで有効です。

    > .bf_set_key YOUR_API_KEY YOUR_API_SECRET
    
`.bf_store_key`コマンドで書き出しを行っておくと起動時に自動で読み込みます。（※平文で保存されます。セキュリティに注意）


APIの詳細は、bitFlyerによる[API Documentation](https://lightning.bitflyer.jp/docs)を参照してください。


      オプション:
    
        -n, --no-banner  スタートアップバナーを表示しない
    
      例:
    
        $ node console.js -n



## 板表示プログラム (book.js)

リアルタイム更新の板表示プログラムです。  
値段範囲で注文をまとめるグルーピング表示に対応しています。(`-g`オプション）


      オプション:
        
        -p, --product <code>  プロダクトコード (デフォルト: BTC_JPY)
        -r, --row <n>         買いと売り注文の表示行数 (デフォルト: 20)
        -g, --group <n>       指定範囲の注文をまとめて表示 (デフォルト: 無効)
        
      例:
        
        $ node book.js -p BTC_JPY -r 32 -g 100
      

## 約定履歴表示プログラム (executions.js)

リアルタイム更新の約定履歴表示プログラムです。


      オプション:
    
        -p, --product <code>  プロダクトコード (デフォルト: BTC_JPY)
        -r, --row <n>         履歴の表示行数 (デフォルト: 40)
    
      例:
    
        $ node executions.js -p ETH_BTC -r 20


## ティッカー表示プログラム (ticker.js)

リアルタイム更新のティッカー表示プログラムです。


      オプション:
    
        -p, --product <code>  カンマ区切りの通貨ペアコード (デフォルト: "BTC_JPY,ETH_BTC,BCH_BTC")
    
      例:
    
        $ node ticker.js -p "BTC_USD,ETH_BTC"



## ライセンス

MIT


BTC: `1BpLZm4JEFiDqAnaexuYMhGJZKdRQJKixP`  
ETH: `0x51349760d4a5287dbfa3961ca2e0006936bc9d88`

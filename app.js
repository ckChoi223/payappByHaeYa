/*
    request, urlencode, querystring 모듈을 콘솔창에서 설치해주시기 바랍니다. (npm install)
    여러분의 코드에 맞게 수정하시기 바랍니다.
*/

var request = require('request');                                   
var urlencode = require('urlencode');
var queryString = require('querystring'); 

/*  payappFirst.html 페이지 렌더링 (과정1) */
app.get('/pay', function(req,res){
    res.render('payappFirst.html');
});

/*  payappFirst.html페이지에서 결제자가 결제요청 (과정2+과정3) */
app.post('/paying_payApp', function(req,res){
    /* dataString에 api연동 parameters를 url형식으로 작성해야 함 */
    /*
    'cmd'	    	=> 'payrequest',			                                              // 결제요청, 필수
	'userid'		=> 'payapp 판매자 아이디',	                                               // 판매자 아이디, 필수

	'goodname'		=> '테스트상품',			                                                    // 상품명, 필수
	'price'			=> '1000',					                                              // 결제요청 금액 (1,000원 이상), 필수
	'recvphone'		=> '',						                                              // 수신자 휴대폰번호 (구매자), 필수
	'memo'			=> '',		                                                              // 결제요청시 메모
	'reqaddr'		=> '0',						                                              // 주소요청 여부
    
	'feedbackurl'	=> ' 예) http://회사 웹사이트/paying_feedback'                                //feedbackurl
    --> returnurl이 가장 중요합니다. payapp에서 결제정보를 post요청을 이용하여 보냅니다. 93번째줄에서 설정
    
	'var1'			=> '',			                                                          // 임의변수1
	
    'var2'			=> '',				                                                      // 임의변수2
												// 임의변수는 고객사의 주문번호,상품코드 등 필요에 따라 자유롭게 이용이 가능합니다. feedbackurl로 값을 전달합니다.
	
    'smsuse'		=> '',						                                              // 결제요청 SMS 발송여부 ('n'인 경우 SMS 발송 안함)
	
    'reqmode'		=> 'krw',					                                             // 요청구분 (krw:원화결제, usd:US달러 결제, unionpay:중국은련카드 결제)
    
	'vccode'		=> '',						                                             // 국제전화 국가번호 (currency가 usd일 경우 필수)
	
'returnurl'		=> '',	                                                                    // 결제완료 이동 URL (결제완료 후 매출전표 페이지에서 "확인" 버튼 클릭시 이동)
    
    'openpaytype'   => '',                                                                  // 결제수단 선택 (휴대전화:phone, 신용카드:card, 계좌이체:rbank, 가상계좌:vbank)
                                                                                            // 판매자 사이트 "설정" 메뉴의 "결제 설정"이 우선 합니다.
                                                                                            // 해외결제는 현재 신용카드 결제만 가능하며, 입력된 값은 무시됩니다.
    
'checkretry'    => 'y'                                                                      // feedbackurl의 응답이 'SUCCESS'가 아닌 경우 feedbackurl 호출을 재시도 합니다. (총 10회)

    */
    
    
    var dataString = ' /*여러분이 작성한 parameters입력 */ ';
    /* ex. var dataString = 'cmd=payrequest&userid=payapp 판매자 아이디....';               */
    /* dataString에 '&'다음에는 parameter를, '='다음에는 입력하실 값을 쓰씨면 됩니다.               */
    /* payappFirst.html에서 요청보낸 form을 적절히 섞어 사용하시면 됩니다. 이건 Node.Js기본이니 생략   */
    
    var encoded = urlencode(dataString);   // url인코딩 시켜야 합니다. http://www.convertstring.com/ko/EncodeDecode/UrlEncode에 접속하셔서 맞게하셨는지 먼저 확인하시길 바랍니다.
    
    var options = {
        url: 'http://api.payapp.kr/oapi/apiLoad.html',
        method: 'POST',
        headers : {
            'Accept' : 'text/html,application/xhtml+xml,*/*',
            'Host' : 'api.payapp.kr',
            'Accept-Language' : 'ko-KR',
            'Content-Type' : 'application/x-www-form-urlencoded',
        },
        body: encoded
    };
    
    function callback(error, response, body) {
        if (!error && response.statusCode == 200) {
            var qObj2 = queryString.parse(body, '&', '=', { maxKeys: 3 });
            
            /* naxKeys를 여러분의 코드에 맞게 바꾸시길 바랍니다. (무조건 1이상이여야함)                         */
            /* naxKeys:1  state만 가져옴 (state==0이면 에러)                                          */
            /* naxKeys:2  state, errorMessage(state==1이면 에러메세지 출력)                            */
            /* naxKeys:3  state, errorMessage,mul_no(성공시 결제요청 번호)                             */
            /* naxKeys:4  state, errorMessage,mul_no,payurl(결제창URL, URL은 인코딩 되어있음)           */
            /*                                                                                    */
            /* payurl은 디코딩 시켜서 사용해야 함. 예를들면, urlencode.decode(qObj2.payurl)               */
            
            if(qObj2.state=='0'){
                res.send("결제 도중 에러가 발생했습니다. 다시 결제를 진행해 주시기바랍니다.");
            } else{
                
                /* DB처리 부분(필요하다면)*/
                res.redirect('/payNext');
            }
        }
    }
    
    request(options, callback);
});

app.get('/payNext', function(req,res){
    res.render('payappSecond.html');
});

/* feedbackurl을 이용하여 개발자가 원하는 DB처리를 합니다.(과정5) */
app.post('/paying_feedback', function(req,res){
    /*
        페이앱쪽에서 보낸 피드백입니다. 
        
        req.body.userid       :	판매자 회원 아이디
        req.body.linkkey      :	연동 KEY
        req.body.linkval      :	연동 VALUE
        req.body.goodname     :	상품명
        req.body.price        :	결제요청 금액
        req.body.recvphone    : 수신 휴대폰번호
        req.body.memo         : 메모
        req.body.reqaddr      :	주소요청 (1:요청, 0:요청안함)
        req.body.reqdate      :	결제요청 일시
        req.body.pay_memo     :	결제시 입력한 메모
        req.body.pay_addr     :	결제시 입력한 주소
        req.body.pay_date     :	결제승인 일시
        req.body.pay_type     :	결제수단 (1:신용카드, 2:휴대전화, 3:해외결제, 4:대면결제, 6:계좌이체, 7:가상계좌, 9:문화상품권)
        req.body.pay_state    : 결제요청 상태 (4:결제완료, 8,16,31:요청취소, 9,64:승인취소, 10:결제대기)
        req.body.var1         :	임의 사용 변수 1
        req.body.var2         :	임의 사용 변수 2
        req.body.mul_no       : 결제요청번호
        req.body.payurl       : 결제페이지 주소
        req.body.csturl       : 매출전표URL
        req.body.card_name    : 신용카드명
        req.body.currency     : 통화 (krw:원화,usd:달러)
        req.body.vccode       :	국제전화 국가번호
        req.body.score        :	DM Score (currency가 usd이고 결제성공일 때 DM 점수
        req.body.vbank        :	은행명 (가상계좌 결제일 경우)
        req.body.vbankno      : 입금계좌번호 (가상계좌 결제일 경우)
        req.body.feedbacktype :	feedback 구분 (0:REST API, 1:COMMON FEEDBACK)
    */
    var payapp_userid	= 'payapp 판매자 아이디';	          // payapp 판매자 아이디
    var payapp_linkkey	= 'payapp 연동key';				// payapp 연동key, 판매자 사이트 로그인 후 설정 메뉴에서 확인 가능
    var payapp_linkval	= 'payapp 연동value';				// payapp 연동value, 판매자 사이트 로그인 후 설정 메뉴에서 확인 가능

    if(req.method === 'POST'){
        if( (payapp_userid==req.body.userid)&&(payapp_linkkey==req.body.linkkey)&&(payapp_linkval==req.body.linkval) ){
            /*
            */
            if(req.body.pay_state!=4){
                //eq.body.pay_state를 스위치문 이용하여 원하시는 작업을 하면 됩니다.
                
                /* DB처리 부분                                                                                */
                
                res.send('SUCCESS');
            } else{ //결제완료가 되었습니다.
                
                /* DB처리 부분                                                                                 */
                /* DB처리를 하신 후 꼭 res.send('SUCCESS'); 를 마지막에 쓰셔야 합니다. redirect나 rendering 하지마세요.   */
                
                res.send('SUCCESS');
            }
        }
    }
    
});

/* 결제자가 결제가 완료되었음을 확인 (과정6) */
app.get('/payConfirm', function(req,res){
    /* 여러분이 DB처리한 것과 비교해 결제가 제대로 완료되었는지 확인후 렌더링시키시기 바랍니다.  */
    res.render('payappThird.html');
});
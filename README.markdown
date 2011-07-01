# Route — роутинг/диспатчинг хеш-уролов #


** Стартуем перехват изменений хеша в урле **

    $(document).ready(function() {
        Route.listen();
    });
   
    
** Если ввели неверный урл или пустой - выполняем эту функцию **

    Route.resetAction(function() {
        console.log('rescue');
    });
   
    
** Мапим схемы урлов на экшены **

Самый простой пример:

    Route.map('#/my-home-page').to(function() {
        console.log('Показываем что-нибудь');
    });
    
    
Поддерживаются пользовательские переменные
    
    Route.map('#/info/:dgCode/:tourId').to(function() {
        console.log(this._getParam('dgCode'));
        console.log(this._getParam('tourId'));
    });
    
    
Параметры могут быть необязательными

    Route.map('#/info/:dgCode(/:tourId)').to(function() {
        console.log(this._getParam('dgCode'));
    });

    
* вконце схемы раскрывается в любое количество key/value/key2/value2 параметров

    Route.map('#/params/*').to(function() {
        console.log(this._getParam('dgCode'));
    });
    
при заходе по урлу #/params/code/213/id/45/name/Dima
мы получим доступ ко всем этим параметрам this._getParam('code'), this._getParam('id'), this._getParam('name')

Можно делать так:

    Route.map('#/params/*')
        .before(function() { 
            // выполниться перед методом .to 
        })
        .to(function() {
            // сам экшн тут
        })
        .after(function() { 
            // выполниться в момент перехода с этого урала на другой 
        });
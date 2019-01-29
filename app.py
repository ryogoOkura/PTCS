from flask import Flask, render_template, request, redirect, url_for, session
import flask_login

app=Flask(__name__)

app.secret_key=b'\xf6]\x94n\x7f\xd8L\x06ZB\xd9A\x0f\xc6+<'
login_manager=flask_login.LoginManager()
login_manager.init_app(app)
users={'foobar':{'password':'secret'}}
class User(flask_login.UserMixin):
    pass

@login_manager.user_loader
def user_loader(user_id):
    if user_id not in users:
        return
    user=User()
    user.id=user_id
    return user

@login_manager.request_loader
def request_loader(request):
    user_id = request.form.get('user_id')
    if user_id not in users:
        return
    user=User()
    user.id=user_id
    user.is_authenticated =  request.form['password']==users[user_id]['password']
    return user

@app.route('/')
def index():
    return render_template('login.html')

@app.route('/login',methods=['GET','POST'])
def login():
    if request.method=='GET':
        return render_template('login.html')

    user_id=request.form['user_id']
    if request.form['password']==users[user_id]['password']:
        user=User()
        user.id=user_id
        flask_login.login_user(user)
        return redirect(url_for('login'))
    return 'Bad login'

@app.route('/logout')
def logout():
    flask_login.logout_user()
    return redirect(url_for('login'))

@login_manager.unauthorized_handler
def unauthorized_handler():
    return 'Unauthorized'

@app.route('/protected')
@flask_login.login_required
def protected():
    return render_template('protected.html', user_id=flask_login.current_user.id)


from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.by import By
from bs4 import BeautifulSoup
import json
@app.route('/scraping',methods=['GET','POST'])
@flask_login.login_required
def scraping():
    if request.method=='POST':
        deckID=request.form['deckID']
        if deckID=='':
            return render_template('scraping.html')
        url='https://www.pokemon-card.com/deck/confirm.html/deckID/'+deckID
        # options=Options()
        # options.binary_location="static\\chromedriver_win32\\chrome.exe"
        # driver=webdriver.Chrome(chrome_options=options,executable_path="static/chromedriver_win32/chromedriver.exe")
        # driver.get(url)
        driver=webdriver.PhantomJS()
        driver.set_window_size(1124, 850)
        driver.implicitly_wait(20)
        url='https://www.pokemon-card.com/deck/confirm.html/deckID/'+deckID
        driver.get(url)
        WAIT_SECOND=30
        WebDriverWait(driver,WAIT_SECOND).until(EC.presence_of_element_located((By.CLASS_NAME, "thumbsImage")))
        html=driver.page_source.encode('utf-8')
        driver.close()
        driver.quit()

        data_list=[['name','copy','src']]
        soup=BeautifulSoup(html, 'html.parser')
        section=soup.find('section',attrs={'id':'cardImagesView'})
        tables=section.find_all('table',attrs={'class':'KSTable KSTable-small'})
        for table in tables:
            trs=table.tbody.find_all('tr')
            name=trs[0].td.a.img.get('alt')
            src='https://www.pokemon-card.com'+trs[0].td.a.img.get('src')
            copy=trs[1].td.span.string
            data_list.append([name,copy,src])
        return render_template('scraping.html',data_list=data_list)
        # jsonstring=json.dumps(data_list,ensure_ascii=False,indent=2)
        # return jsonstring
    else:
        return render_template('scraping.html')
#'''

if __name__=='__main__':
    # app.debug=True
    app.run(host='0.0.0.0') #どこからでもアクセス可能
    # app.run(host='localhost')

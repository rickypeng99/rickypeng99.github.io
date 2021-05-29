import './pageStyle.css'

function AboutPage() {
  return (
    <div className="about_container">
      <video autoPlay muted loop id="intro_video">
        <source src="/assets/videos/joker.mp4" type="video/mp4"/>
      </video>
      {/* <div className="intro_container animate__animated animate__zoomIn"> */}
      <div className="intro_container">
        <div className="intro">
          <img className="about_photo" src="/assets/images/graduation_2.jpg" alt="My gradution"/>
          <div className="sub_intro">
              <h1 class="display-4">Ricky (Ruiqi) Peng</h1>
              <hr class="my-4"/>
              <div style={{maxWidth: "25rem"}}>
                <p>
                  I am an Incoming Software Engineer at <a href="https://www.amazon.com/luna/landing-page">Amazon Luna</a>. 
                  Previously, I interned at the <a href="https://work.weixin.qq.com/">WeChat Work</a> team at <a href="https://www.tencent.com/en-us/index.html">Tencent</a>, 
                   and the <a href="https://www.caterpillar.com/en/careers/career-areas/information-analytics.html">Digital & Analytics divison</a> at <a href="https://www.caterpillar.com">Caterpillar.inc</a>. I 
                  received my B.S degree in Computer Science (and Statistics) from <a href="https://illinois.edu/">University of Illinois at Urbana Champaign (UIUC)</a> in May 2021.
                </p>
                <p>
                  I am a self-motivated individual who is highly interested in all kinds of application development and is particularily
                  into building graphical interfaces for websites, apps and video games.
                </p>
                <p class="mb-0">
                  "It is those who possess wisdom who are the greatest fools. History has shown us this. You could say that this is the final warning from God to those who resist."
                </p>
                <footer class="blockquote-footer">
                  Okabe Rintaro <a href="https://en.wikipedia.org/wiki/Steins;Gate"><cite title="Source Title">Steins;Gates</cite></a>
                </footer>
              </div>
              
          </div>
        </div>
        <div className="social">
          <i class="fab fa-facebook-square fa-2x" onClick={()=>window.location.href = 'https://www.facebook.com/ricky.peng.921/'}></i>   
          <i class="fab fa-linkedin fa-2x" onClick={()=>window.location.href = 'https://www.linkedin.com/in/rickypeng99/'}></i>   
          <i class="fab fa-github-square fa-2x" onClick={()=>window.location.href = 'https://github.com/rickypeng99/'}></i>   
        </div>
      </div>
    </div>

    
  );
}

export default AboutPage;

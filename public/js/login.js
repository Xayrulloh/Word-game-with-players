submit.onclick = async(e) => {
  e.preventDefault()
  if (username.value.trim().split(' ').length > 1 || !username.value || !image.files.length) return alert('Invalid input')
  if (image.files[0].type == 'image/jpeg' || image.files[0].type == 'image/png') {
    let formData = new FormData()
    formData.append('image', image.files[0])
    formData.append('username', username.value)
    
    try {
      const test = await fetch('/enter', {
        method: 'POST',
        body: formData
      })
      const data = await test.json()
      if (data.status >= 400 && data.status <= 499) {throw new Error('Deeng')}
      
      window.localStorage.setItem('userId', data.userId)
      if (data.site == '/game') {
        // window.location = data.site
      } else {
        alert('Please try later again')
      }
    }catch (error) {
      console.log(error);
      // window.location = '/404'
      alert('Something went wrong')
    }
  } else alert('Invalid input')
}




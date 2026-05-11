

const Dashboard = () => {

    const user = JSON.parse(localStorage.getItem("user"));
    const username = user.username;
    const email = user.email;


  return (
    <div>Dashboard
        name: {username}
        email: {email}
    </div>
  )
}

export default Dashboard
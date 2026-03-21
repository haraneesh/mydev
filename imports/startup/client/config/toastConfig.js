import { toast, Slide } from 'react-toastify';

toast.configure({
  position: toast.POSITION.TOP_CENTER,
  autoClose: 5000,
  transition: Slide,
  hideProgressBar: true,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
});

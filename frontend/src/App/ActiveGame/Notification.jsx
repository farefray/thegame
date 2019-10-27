import { useEffect } from 'react';
import { Alert } from 'rsuite';

function Notification({ notificationObject }) {
  console.log("TCL: Notification -> notificationObject", notificationObject)
  useEffect(() => {
    if (notificationObject && notificationObject.type) {
      const { message } = notificationObject;
      switch (notificationObject.type) {
        case 'error': {
          Alert.error(message, 5000);
          break;
        }
      
        case 'warning': {
          Alert.warning(message, 5000);
          break;
        }

        case 'info': {
          Alert.info(message, 5000);
          break;
        }

        case 'success': {
          Alert.success(message, 5000);
          break;
        }

        default:
          break;
      }
    }
  }, [notificationObject])

  return '';
}

export default Notification;

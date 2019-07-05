import pt from 'date-fns/locale/pt';
import { format, parseISO } from 'date-fns';
import Mail from '../../lib/Mail';

class SubscriptionMail {
  // every job nesse a unique key
  get key() {
    return 'SubscriptionMail';
  }

  async handle({ data }) {
    const { meetup, user } = data;

    await Mail.sendMail({
      to: `${user.name} <${user.email}>`,
      subject: 'Inscrição na meetup',
      template: 'subscription',
      context: {
        meetup: meetup.title,
        user: user.name,
        date: format(
          parseISO(meetup.date),
          "'Dia' dd 'de' MMMM', às' H:mm'h'  ",
          {
            locale: pt,
          }
        ),
      },
    });
  }
}
export default new SubscriptionMail();

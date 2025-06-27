import { Card } from '../components/ui/Card';

const PrivacyPage = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
          <p className="text-lg text-gray-600">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>

        <Card className="p-8">
          <div className="prose max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Introduction</h2>
              <p className="text-gray-700 mb-4">
                MyOwnStore ("we," "our," or "us") respects your privacy and is committed to protecting 
                your personal data. This privacy policy will inform you about how we look after your 
                personal data when you visit our website and tell you about your privacy rights and 
                how the law protects you.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Important Information</h2>
              <p className="text-gray-700 mb-4">
                This privacy policy aims to give you information on how MyOwnStore collects and 
                processes your personal data through your use of this website, including any data 
                you may provide through this website when you purchase a product or service, 
                sign up to our newsletter, or take part in a competition.
              </p>
              <p className="text-gray-700 mb-4">
                This website is not intended for children and we do not knowingly collect data 
                relating to children.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Data We Collect</h2>
              <p className="text-gray-700 mb-4">
                We may collect, use, store and transfer different kinds of personal data about you:
              </p>
              
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Identity Data</h3>
                <ul className="list-disc list-inside text-gray-700 mb-4 space-y-1">
                  <li>First name, last name, username</li>
                  <li>Date of birth</li>
                  <li>Gender</li>
                </ul>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Contact Data</h3>
                <ul className="list-disc list-inside text-gray-700 mb-4 space-y-1">
                  <li>Billing address, delivery address</li>
                  <li>Email address</li>
                  <li>Telephone numbers</li>
                </ul>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Financial Data</h3>
                <ul className="list-disc list-inside text-gray-700 mb-4 space-y-1">
                  <li>Bank account and payment card details</li>
                  <li>Transaction history</li>
                </ul>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Technical Data</h3>
                <ul className="list-disc list-inside text-gray-700 mb-4 space-y-1">
                  <li>Internet protocol (IP) address</li>
                  <li>Browser type and version</li>
                  <li>Time zone setting and location</li>
                  <li>Operating system and platform</li>
                </ul>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Usage Data</h3>
                <ul className="list-disc list-inside text-gray-700 mb-4 space-y-1">
                  <li>Information about how you use our website</li>
                  <li>Products and services you view or search for</li>
                  <li>Page response times and download errors</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. How We Use Your Data</h2>
              <p className="text-gray-700 mb-4">
                We will only use your personal data when the law allows us to. Most commonly, 
                we will use your personal data in the following circumstances:
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                <li>To process and deliver your order including managing payments and collecting money owed</li>
                <li>To manage our relationship with you including notifying you about changes to our terms</li>
                <li>To enable you to partake in a prize draw, competition or complete a survey</li>
                <li>To administer and protect our business and website including troubleshooting and data analysis</li>
                <li>To deliver relevant website content and advertisements to you</li>
                <li>To use data analytics to improve our website, products/services, marketing, and customer experience</li>
                <li>To make suggestions and recommendations to you about goods or services that may interest you</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Marketing</h2>
              <p className="text-gray-700 mb-4">
                We strive to provide you with choices regarding certain personal data uses, 
                particularly around marketing and advertising. You can ask us or third parties 
                to stop sending you marketing messages at any time by:
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-1">
                <li>Following the opt-out links on any marketing message sent to you</li>
                <li>Contacting us at any time</li>
                <li>Updating your preferences in your account settings</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Cookies</h2>
              <p className="text-gray-700 mb-4">
                Our website uses cookies to distinguish you from other users of our website. 
                This helps us to provide you with a good experience when you browse our website 
                and also allows us to improve our site.
              </p>
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Types of Cookies We Use:</h3>
                <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                  <li><strong>Strictly necessary cookies:</strong> Required for the operation of our website</li>
                  <li><strong>Analytical cookies:</strong> Allow us to recognize and count visitors and see how they move around</li>
                  <li><strong>Functionality cookies:</strong> Used to recognize you when you return to our website</li>
                  <li><strong>Targeting cookies:</strong> Record your visit and the pages you visit to deliver relevant advertisements</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Data Security</h2>
              <p className="text-gray-700 mb-4">
                We have put in place appropriate security measures to prevent your personal data 
                from being accidentally lost, used or accessed in an unauthorized way, altered or 
                disclosed. We limit access to your personal data to those employees, agents, 
                contractors and other third parties who have a business need to know.
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-1">
                <li>SSL encryption for all data transmission</li>
                <li>Secure servers with regular security updates</li>
                <li>Limited access to personal data on a need-to-know basis</li>
                <li>Regular security audits and monitoring</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Data Retention</h2>
              <p className="text-gray-700 mb-4">
                We will only retain your personal data for as long as necessary to fulfil the 
                purposes we collected it for, including for the purposes of satisfying any legal, 
                accounting, or reporting requirements.
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-1">
                <li>Account data: Retained while your account is active</li>
                <li>Transaction data: Retained for 7 years for legal and tax purposes</li>
                <li>Marketing data: Retained until you unsubscribe</li>
                <li>Technical data: Retained for 2 years for analytics purposes</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Your Legal Rights</h2>
              <p className="text-gray-700 mb-4">
                Under certain circumstances, you have rights under data protection laws in 
                relation to your personal data:
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                <li><strong>Request access</strong> to your personal data</li>
                <li><strong>Request correction</strong> of your personal data</li>
                <li><strong>Request erasure</strong> of your personal data</li>
                <li><strong>Object to processing</strong> of your personal data</li>
                <li><strong>Request restriction</strong> of processing your personal data</li>
                <li><strong>Request transfer</strong> of your personal data</li>
                <li><strong>Right to withdraw consent</strong> at any time</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Third-Party Links</h2>
              <p className="text-gray-700 mb-4">
                This website may include links to third-party websites, plug-ins and applications. 
                Clicking on those links or enabling those connections may allow third parties to 
                collect or share data about you. We do not control these third-party websites and 
                are not responsible for their privacy statements.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Changes to Privacy Policy</h2>
              <p className="text-gray-700 mb-4">
                We reserve the right to update this privacy policy at any time, and we will provide 
                you with a new privacy policy when we make any substantial updates. We may also 
                notify you in other ways from time to time about the processing of your personal information.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Contact Us</h2>
              <p className="text-gray-700 mb-4">
                If you have any questions about this privacy policy or our privacy practices, 
                please contact us:
              </p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700">
                  <strong>Email:</strong> privacy@myownstore.com<br />
                  <strong>Phone:</strong> (555) 123-4567<br />
                  <strong>Address:</strong> 123 Commerce St, Business City, BC 12345<br />
                  <strong>Data Protection Officer:</strong> dpo@myownstore.com
                </p>
              </div>
            </section>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default PrivacyPage;

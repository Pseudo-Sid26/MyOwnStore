import { Card } from '../components/ui/Card';

const TermsPage = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Terms of Service</h1>
          <p className="text-lg text-gray-600">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>

        <Card className="p-8">
          <div className="prose max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Agreement to Terms</h2>
              <p className="text-gray-700 mb-4">
                By accessing and using MyOwnStore, you accept and agree to be bound by the terms and 
                provision of this agreement. If you do not agree to abide by the above, please do not 
                use this service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Use License</h2>
              <p className="text-gray-700 mb-4">
                Permission is granted to temporarily download one copy of the materials on MyOwnStore's 
                website for personal, non-commercial transitory viewing only. This is the grant of a 
                license, not a transfer of title, and under this license you may not:
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                <li>modify or copy the materials;</li>
                <li>use the materials for any commercial purpose or for any public display (commercial or non-commercial);</li>
                <li>attempt to decompile or reverse engineer any software contained on the website;</li>
                <li>remove any copyright or other proprietary notations from the materials.</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Account Terms</h2>
              <p className="text-gray-700 mb-4">
                When you create an account with us, you must provide information that is accurate, 
                complete, and current at all times. You are responsible for safeguarding the password 
                and for all activities that occur under your account.
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                <li>You must be at least 13 years old to use this service</li>
                <li>You are responsible for maintaining the security of your account</li>
                <li>You must not use the service for any illegal or unauthorized purpose</li>
                <li>You must not violate any laws in your jurisdiction</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Orders and Payments</h2>
              <p className="text-gray-700 mb-4">
                By placing an order with us, you offer to purchase a product on and subject to the 
                following terms and conditions. All orders are subject to availability and confirmation 
                of the order price.
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                <li>We reserve the right to refuse any order you place with us</li>
                <li>Prices are subject to change without notice</li>
                <li>Payment must be received by us before we process your order</li>
                <li>We accept major credit cards, PayPal, and other payment methods as displayed</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Shipping and Delivery</h2>
              <p className="text-gray-700 mb-4">
                We will arrange for shipment of the products to you. Please check the individual 
                product pages for specific delivery information. Title and risk of loss pass to you 
                upon our delivery to the carrier.
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                <li>Standard shipping takes 3-7 business days</li>
                <li>Express shipping options are available at checkout</li>
                <li>We are not responsible for delays caused by the shipping carrier</li>
                <li>International shipping may be subject to customs duties and taxes</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Returns and Refunds</h2>
              <p className="text-gray-700 mb-4">
                We want you to be completely satisfied with your purchase. If you're not satisfied, 
                you may return most items within 30 days of purchase for a full refund or exchange.
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                <li>Items must be returned in original condition</li>
                <li>Original packaging and tags must be included</li>
                <li>Certain items may not be eligible for return (perishables, custom items, etc.)</li>
                <li>Return shipping costs are the responsibility of the customer unless the item was defective</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Privacy Policy</h2>
              <p className="text-gray-700 mb-4">
                Your privacy is important to us. Our Privacy Policy explains how we collect, use, and 
                protect your information when you use our service. By using our service, you agree to 
                the collection and use of information in accordance with our Privacy Policy.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Prohibited Uses</h2>
              <p className="text-gray-700 mb-4">
                You may not use our service:
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                <li>For any unlawful purpose or to solicit others to unlawful acts</li>
                <li>To violate any international, federal, provincial, or state regulations, rules, laws, or local ordinances</li>
                <li>To infringe upon or violate our intellectual property rights or the intellectual property rights of others</li>
                <li>To harass, abuse, insult, harm, defame, slander, disparage, intimidate, or discriminate</li>
                <li>To submit false or misleading information</li>
                <li>To upload or transmit viruses or any other type of malicious code</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Disclaimer</h2>
              <p className="text-gray-700 mb-4">
                The information on this website is provided on an "as is" basis. To the fullest extent 
                permitted by law, this Company excludes all representations, warranties, conditions and 
                terms whether express or implied including those implied by law, trade usage or course of dealings.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Limitation of Liability</h2>
              <p className="text-gray-700 mb-4">
                In no event shall MyOwnStore or its suppliers be liable for any damages (including, 
                without limitation, damages for loss of data or profit, or due to business interruption) 
                arising out of the use or inability to use the materials on MyOwnStore's website.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Governing Law</h2>
              <p className="text-gray-700 mb-4">
                These terms and conditions are governed by and construed in accordance with the laws and 
                you irrevocably submit to the exclusive jurisdiction of the courts in that state or location.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Changes to Terms</h2>
              <p className="text-gray-700 mb-4">
                MyOwnStore reserves the right to revise these terms of service at any time without notice. 
                By using this website, you are agreeing to be bound by the current version of these terms 
                of service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">13. Contact Information</h2>
              <p className="text-gray-700 mb-4">
                If you have any questions about these Terms of Service, please contact us at:
              </p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700">
                  <strong>Email:</strong> legal@myownstore.com<br />
                  <strong>Phone:</strong> (555) 123-4567<br />
                  <strong>Address:</strong> 123 Commerce St, Business City, BC 12345
                </p>
              </div>
            </section>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default TermsPage;

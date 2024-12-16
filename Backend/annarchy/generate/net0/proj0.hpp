/*
 *  ANNarchy-version: 4.7.3
 */
#pragma once

#include "ANNarchy.h"
#include "LILInvMatrix.hpp"




extern PopStruct0 pop0;
extern PopStruct1 pop1;
extern double dt;
extern long int t;

extern std::vector<std::mt19937> rng;

/////////////////////////////////////////////////////////////////////////////
// proj0: LIF_Neuron1 -> LIF_Neuron2 with target exc
/////////////////////////////////////////////////////////////////////////////
struct ProjStruct0 : LILInvMatrix<int, int> {
    ProjStruct0() : LILInvMatrix<int, int>( 1, 1) {
    }


    bool init_from_lil( std::vector<int> row_indices,
                        std::vector< std::vector<int> > column_indices,
                        std::vector< std::vector<double> > values,
                        std::vector< std::vector<int> > delays) {
        bool success = static_cast<LILInvMatrix<int, int>*>(this)->init_matrix_from_lil(row_indices, column_indices);
        if (!success)
            return false;

        w = values[0][0];


        // init other variables than 'w' or delay
        if (!init_attributes()){
            return false;
        }

    #ifdef _DEBUG_CONN
        static_cast<LILInvMatrix<int, int>*>(this)->print_data_representation();
    #endif
        return true;
    }





    // Transmission and plasticity flags
    bool _transmission, _axon_transmission, _plasticity, _update;
    int _update_period;
    long int _update_offset;





    // Local parameter delay
    std::vector< std::vector<double > > delay;

    // Local parameter weight
    std::vector< std::vector<double > > weight;

    // Global parameter w
    double  w ;

    // Local variable I
    std::vector< std::vector<double > > I;




    // Method called to allocate/initialize the variables
    bool init_attributes() {

        // Local parameter delay
        delay = init_matrix_variable<double>(static_cast<double>(0.0));

        // Local parameter weight
        weight = init_matrix_variable<double>(static_cast<double>(0.0));

        // Local variable I
        I = init_matrix_variable<double>(static_cast<double>(0.0));




        return true;
    }

    // Method called to initialize the projection
    void init_projection() {
    #ifdef _DEBUG
        std::cout << "ProjStruct0::init_projection() - this = " << this << std::endl;
    #endif

        _transmission = true;
        _axon_transmission = true;
        _update = true;
        _plasticity = true;
        _update_period = 1;
        _update_offset = 0L;

        init_attributes();



    }

    // Spiking networks: reset the ring buffer when non-uniform
    void reset_ring_buffer() {

    }

    // Spiking networks: update maximum delay when non-uniform
    void update_max_delay(int d){

    }

    // Computes the weighted sum of inputs or updates the conductances
    void compute_psp() {
    #ifdef _TRACE_SIMULATION_STEPS
        std::cout << "    ProjStruct0::compute_psp()" << std::endl;
    #endif
int nb_post; double sum;

        // Event-based summation
        if (_transmission && pop1._active){


            // Iterate over all incoming spikes (possibly delayed constantly)
            for(int _idx_j = 0; _idx_j < pop0.spiked.size(); _idx_j++){
                // Rank of the presynaptic neuron
                int rk_j = pop0.spiked[_idx_j];
                // Find the presynaptic neuron in the inverse connectivity matrix
                auto inv_post_ptr = inv_pre_rank.find(rk_j);
                if (inv_post_ptr == inv_pre_rank.end())
                    continue;
                // List of postsynaptic neurons receiving spikes from that neuron
                std::vector< std::pair<int, int> >& inv_post = inv_post_ptr->second;
                // Number of post neurons
                int nb_post = inv_post.size();

                // Iterate over connected post neurons
                for(int _idx_i = 0; _idx_i < nb_post; _idx_i++){
                    // Retrieve the correct indices
                    int i = inv_post[_idx_i].first;
                    int j = inv_post[_idx_i].second;

                    // Event-driven integration

                    // Update conductance

                    // Increase the post-synaptic conductance g_target += w
                    pop1.g_exc[post_rank[i]] += w;

                    // Synaptic plasticity: pre-events

                    // I += weight
                    I[i][j] += weight[i][j];

                }
            }
        } // active

    }

    // Draws random numbers
    void update_rng() {

    }

    // Updates synaptic variables
    void update_synapse() {
    #ifdef _TRACE_SIMULATION_STEPS
        std::cout << "    ProjStruct0::update_synapse()" << std::endl;
    #endif


    }

    // Post-synaptic events
    void post_event() {

    }

    // Variable/Parameter access methods

    std::vector<std::vector<double>> get_local_attribute_all_double(std::string name) {
    #ifdef _DEBUG
        std::cout << "ProjStruct0::get_local_attribute_all_double(name = "<<name<<")" << std::endl;
    #endif

        // Local parameter delay
        if ( name.compare("delay") == 0 ) {

            return get_matrix_variable_all<double>(delay);
        }

        // Local parameter weight
        if ( name.compare("weight") == 0 ) {

            return get_matrix_variable_all<double>(weight);
        }

        // Local variable I
        if ( name.compare("I") == 0 ) {

            return get_matrix_variable_all<double>(I);
        }


        // should not happen
        std::cerr << "ProjStruct0::get_local_attribute_all_double: " << name << " not found" << std::endl;
        return std::vector<std::vector<double>>();
    }

    std::vector<double> get_local_attribute_row_double(std::string name, int rk_post) {
    #ifdef _DEBUG
        std::cout << "ProjStruct0::get_local_attribute_row_double(name = "<<name<<", rk_post = "<<rk_post<<")" << std::endl;
    #endif

        // Local parameter delay
        if ( name.compare("delay") == 0 ) {

            return get_matrix_variable_row<double>(delay, rk_post);
        }

        // Local parameter weight
        if ( name.compare("weight") == 0 ) {

            return get_matrix_variable_row<double>(weight, rk_post);
        }

        // Local variable I
        if ( name.compare("I") == 0 ) {

            return get_matrix_variable_row<double>(I, rk_post);
        }


        // should not happen
        std::cerr << "ProjStruct0::get_local_attribute_row_double: " << name << " not found" << std::endl;
        return std::vector<double>();
    }

    double get_local_attribute_double(std::string name, int rk_post, int rk_pre) {
    #ifdef _DEBUG
        std::cout << "ProjStruct0::get_local_attribute_double(name = "<<name<<", rk_post = "<<rk_post<<", rk_pre = "<<rk_pre<<")" << std::endl;
    #endif

        // Local parameter delay
        if ( name.compare("delay") == 0 ) {

            return get_matrix_variable<double>(delay, rk_post, rk_pre);
        }

        // Local parameter weight
        if ( name.compare("weight") == 0 ) {

            return get_matrix_variable<double>(weight, rk_post, rk_pre);
        }

        // Local variable I
        if ( name.compare("I") == 0 ) {

            return get_matrix_variable<double>(I, rk_post, rk_pre);
        }


        // should not happen
        std::cerr << "ProjStruct0::get_local_attribute: " << name << " not found" << std::endl;
        return 0.0;
    }

    void set_local_attribute_all_double(std::string name, std::vector<std::vector<double>> value) {
    #ifdef _DEBUG
        auto min_value = std::numeric_limits<double>::max();
        auto max_value = std::numeric_limits<double>::min();
        for (auto it = value.cbegin(); it != value.cend(); it++ ){
            auto loc_min = *std::min_element(it->cbegin(), it->cend());
            if (loc_min < min_value)
                min_value = loc_min;
            auto loc_max = *std::max_element(it->begin(), it->end());
            if (loc_max > max_value)
                max_value = loc_max;
        }
        std::cout << "ProjStruct0::set_local_attribute_all_double(name = " << name << ", min(" << name << ")=" <<std::to_string(min_value) << ", max("<<name<<")="<<std::to_string(max_value)<< ")" << std::endl;
    #endif

        // Local parameter delay
        if ( name.compare("delay") == 0 ) {
            update_matrix_variable_all<double>(delay, value);

            return;
        }

        // Local parameter weight
        if ( name.compare("weight") == 0 ) {
            update_matrix_variable_all<double>(weight, value);

            return;
        }

        // Local variable I
        if ( name.compare("I") == 0 ) {
            update_matrix_variable_all<double>(I, value);

            return;
        }

    }

    void set_local_attribute_row_double(std::string name, int rk_post, std::vector<double> value) {
    #ifdef _DEBUG
        std::cout << "ProjStruct0::set_local_attribute_row_double(name = "<<name<<", rk_post = " << rk_post << ", min("<<name<<")="<<std::to_string(*std::min_element(value.begin(), value.end())) << ", max("<<name<<")="<<std::to_string(*std::max_element(value.begin(), value.end()))<< ")" << std::endl;
    #endif

        // Local parameter delay
        if ( name.compare("delay") == 0 ) {
            update_matrix_variable_row<double>(delay, rk_post, value);

            return;
        }

        // Local parameter weight
        if ( name.compare("weight") == 0 ) {
            update_matrix_variable_row<double>(weight, rk_post, value);

            return;
        }

        // Local variable I
        if ( name.compare("I") == 0 ) {
            update_matrix_variable_row<double>(I, rk_post, value);

            return;
        }

    }

    void set_local_attribute_double(std::string name, int rk_post, int rk_pre, double value) {
    #ifdef _DEBUG
        std::cout << "ProjStruct0::set_local_attribute_double(name = "<<name<<", rk_post = "<<rk_post<<", rk_pre = "<<rk_pre<<", value = " << std::to_string(value) << ")" << std::endl;
    #endif

        // Local parameter delay
        if ( name.compare("delay") == 0 ) {
            update_matrix_variable<double>(delay, rk_post, rk_pre, value);

            return;
        }

        // Local parameter weight
        if ( name.compare("weight") == 0 ) {
            update_matrix_variable<double>(weight, rk_post, rk_pre, value);

            return;
        }

        // Local variable I
        if ( name.compare("I") == 0 ) {
            update_matrix_variable<double>(I, rk_post, rk_pre, value);

            return;
        }

    }

    double get_global_attribute_double(std::string name) {

        // Global parameter w
        if ( name.compare("w") == 0 ) {

            return w;
        }


        // should not happen
        std::cerr << "ProjStruct0::get_global_attribute_double: " << name << " not found" << std::endl;
        return 0.0;
    }

    void set_global_attribute_double(std::string name, double value) {

        // Global parameter w
        if ( name.compare("w") == 0 ) {
            w = value;

            return;
        }

    }


    // Access additional


    // Memory management
    long int size_in_bytes() {
        long int size_in_bytes = 0;

        // connectivity
        size_in_bytes += static_cast<LILInvMatrix<int, int>*>(this)->size_in_bytes();

        // Local variable I
        size_in_bytes += sizeof(std::vector<std::vector<double>>);
        size_in_bytes += sizeof(std::vector<double>) * I.capacity();
        for(auto it = I.cbegin(); it != I.cend(); it++)
            size_in_bytes += (it->capacity()) * sizeof(double);

        // Local parameter delay
        size_in_bytes += sizeof(std::vector<std::vector<double>>);
        size_in_bytes += sizeof(std::vector<double>) * delay.capacity();
        for(auto it = delay.cbegin(); it != delay.cend(); it++)
            size_in_bytes += (it->capacity()) * sizeof(double);

        // Local parameter weight
        size_in_bytes += sizeof(std::vector<std::vector<double>>);
        size_in_bytes += sizeof(std::vector<double>) * weight.capacity();
        for(auto it = weight.cbegin(); it != weight.cend(); it++)
            size_in_bytes += (it->capacity()) * sizeof(double);

        // Global parameter w
        size_in_bytes += sizeof(double);

        return size_in_bytes;
    }

    // Structural plasticity



    void clear() {
    #ifdef _DEBUG
        std::cout << "ProjStruct0::clear() - this = " << this << std::endl;
    #endif

        // Connectivity
        static_cast<LILInvMatrix<int, int>*>(this)->clear();

        // I
        for (auto it = I.begin(); it != I.end(); it++) {
            it->clear();
            it->shrink_to_fit();
        };
        I.clear();
        I.shrink_to_fit();

        // delay
        for (auto it = delay.begin(); it != delay.end(); it++) {
            it->clear();
            it->shrink_to_fit();
        };
        delay.clear();
        delay.shrink_to_fit();

        // weight
        for (auto it = weight.begin(); it != weight.end(); it++) {
            it->clear();
            it->shrink_to_fit();
        };
        weight.clear();
        weight.shrink_to_fit();

    }
};

